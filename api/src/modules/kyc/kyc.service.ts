import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KYCRecord, KYCStatus, IDType } from './entities/kyc.entity';
import { ILike, Like } from 'typeorm';
import { SystemSetting } from './entities/system-setting.entity';
import { UserService } from '../user/user.service';
import { UserStatus } from '../user/entities/user.entity';

@Injectable()
export class KYCService {
  constructor(
    @InjectRepository(KYCRecord)
    private kycRepository: Repository<KYCRecord>,
    @InjectRepository(SystemSetting)
    private settingsRepository: Repository<SystemSetting>,
    private userService: UserService,
  ) {}

  async getSetting(key: string): Promise<string | null> {
    const setting = await this.settingsRepository.findOne({ where: { key } });
    return setting ? setting.value : null;
  }

  async saveSetting(key: string, value: string): Promise<void> {
    await this.settingsRepository.save({ key, value });
  }

  async getSettings(keys: string[]): Promise<Record<string, string>> {
    const settings = await this.settingsRepository.find();
    const result: Record<string, string> = {};
    keys.forEach(key => {
      const s = settings.find(item => item.key === key);
      result[key] = s ? s.value : '';
    });
    return result;
  }

  async analyzeDocument(base64Image: string): Promise<any> {
    const apiKey = await this.getSetting('OPEN_ROUTER_API_KEY');
    const model = await this.getSetting('AI_MODEL') || 'google/gemini-2.0-flash-001';

    if (!apiKey || apiKey.trim() === '' || apiKey === 'Admin1234!') {
      console.warn('Open Router API Key not configured or invalid. Using mock analysis.');
      return {
        full_name: 'DEMO USER',
        id_number: 'ID-' + Math.random().toString(36).substring(7).toUpperCase(),
        id_type: 'PASSPORT',
        date_of_birth: '1990-01-01',
        expiry_date: '2030-12-31',
        nationality: 'Somaliland',
        searchable_text: 'MOCK DATA FOR PROTOTYPE',
      };
    }

    console.log(`Dispatching AI Analysis to OpenRouter using model: ${model}. Key length: ${apiKey?.length || 0}`);
    
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://gencom.io', // Required by OpenRouter
          'X-Title': 'Gencom Pay',
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Extract all details from this document. IMPORTANT: Identify if this is a "Passport" or "National ID Card". Return ONLY a JSON object with keys: full_name, id_number, id_type (must be either "PASSPORT" or "NATIONAL_ID"), date_of_birth, expiry_date, nationality, and searchable_text.',
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: base64Image.startsWith('data:') ? base64Image : `data:image/jpeg;base64,${base64Image}`,
                  },
                },
              ],
            },
          ],
          response_format: { type: 'json_object' },
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        const errorMsg = data.error?.message || `AI Analysis failed with status ${response.status}`;
        console.error('OpenRouter Error Response:', data);
        
        if (response.status === 401 || response.status === 403) {
          throw new Error(`Invalid AI API Key. Please check your OpenRouter configuration. Details: ${errorMsg}`);
        }
        if (response.status === 429) {
          throw new Error('AI Analysis rate limit exceeded. Please try again later.');
        }
        throw new Error(errorMsg);
      }

      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('AI returned an empty response.');
      }

      return typeof content === 'string' ? JSON.parse(content) : content;
    } catch (err: any) {
      console.error('KYC Analysis Exception:', err);
      // Re-throw as a clean error for NestJS to handle (still results in 500 if not caught, but with better message)
      // Actually, we could return a 400 instead.
      throw new Error(`AI Analysis Error: ${err.message}`);
    }
  }

  async submitKYC(
    userId: string, 
    idNumber: string, 
    idType: IDType, 
    fullName?: string,
    extractedData?: any,
    searchableText?: string
  ): Promise<KYCRecord> {
    const existing = await this.kycRepository.findOne({ where: { user_id: userId } });
    if (existing && existing.status === KYCStatus.APPROVED) {
      throw new ConflictException('KYC already approved');
    }

    const record = existing || new KYCRecord();
    record.user_id = userId;
    record.id_number = idNumber;
    record.id_type = idType;
    record.status = KYCStatus.PENDING;
    record.extracted_data = extractedData;
    record.searchable_text = searchableText;

    if (fullName) {
      await this.userService.updateProfile(userId, { full_name: fullName });
    }

    return this.kycRepository.save(record);
  }

  async findByUserId(userId: string): Promise<KYCRecord> {
    const record = await this.kycRepository.findOne({ where: { user_id: userId } });
    if (!record) {
      throw new NotFoundException('KYC record not found');
    }
    return record;
  }

  async approveKYC(id: string): Promise<KYCRecord> {
    const record = await this.kycRepository.findOne({ where: { id } });
    if (!record) throw new NotFoundException('Record not found');

    record.status = KYCStatus.APPROVED;
    record.verified_at = new Date();
    
    const updated = await this.kycRepository.save(record);

    // Update user status to VERIFIED
    await this.userService.updateStatus(record.user_id, UserStatus.VERIFIED);
    
    return updated;
  }

  async rejectKYC(id: string, reason: string): Promise<KYCRecord> {
    const record = await this.kycRepository.findOne({ where: { id } });
    if (!record) throw new NotFoundException('Record not found');

    record.status = KYCStatus.REJECTED;
    record.rejection_reason = reason;
    
    return this.kycRepository.save(record);
  }

  async suspendKYC(id: string): Promise<KYCRecord> {
    const record = await this.kycRepository.findOne({ where: { id } });
    if (!record) throw new NotFoundException('Record not found');
    record.status = KYCStatus.REJECTED;
    record.rejection_reason = 'Account suspended by administrator';
    await this.userService.updateStatus(record.user_id, UserStatus.SUSPENDED);
    return this.kycRepository.save(record);
  }

  async findAll(filters?: {
    search?: string;
    status?: string;
    idType?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: KYCRecord[]; total: number; page: number; pages: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.kycRepository.createQueryBuilder('kyc')
      .leftJoinAndSelect('kyc.user', 'user')
      .orderBy('kyc.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    if (filters?.status) {
      qb.andWhere('kyc.status = :status', { status: filters.status });
    }
    if (filters?.idType) {
      qb.andWhere('kyc.id_type = :idType', { idType: filters.idType });
    }
    if (filters?.search) {
      const s = `%${filters.search.toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(user.full_name) LIKE :s OR LOWER(user.email) LIKE :s OR LOWER(kyc.id_number) LIKE :s OR LOWER(kyc.searchable_text) LIKE :s)',
        { s }
      );
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, pages: Math.ceil(total / limit) };
  }

  async findAllPending(): Promise<KYCRecord[]> {
    return this.kycRepository.find({ 
      where: { status: KYCStatus.PENDING },
      relations: ['user']
    });
  }
}
