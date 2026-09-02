export type ApplicationStatus = 'pending' | 'interview' | 'rejected' | 'offered';

export interface JobApplication {
  id: string;
  company_name: string;
  job_title: string;
  location: string;
  salary_range?: string;
  job_url: string;
  source: 'karirhub' | 'manual';
  status: ApplicationStatus;
  applied_at: string;
  updated_at: string;
  notes?: string;
  interview_date?: string;
  tags?: string[];
}

export interface ApplicationStats {
  total: number;
  pending: number;
  interview: number;
  rejected: number;
  offered: number;
  responseRate: number;
  interviewRate: number;
}
