import { Company } from '@shared/state';
import { MockApiService } from '@shared/utils';

export interface ModuleDefinition {
  id: string;
  name: string;
  description: string;
}

export const AVAILABLE_MODULES: ModuleDefinition[] = [
  { 
    id: 'crm', 
    name: 'CRM', 
    description: 'Customer Relationship Management' 
  },
  { 
    id: 'inventory', 
    name: 'Inventory', 
    description: 'Inventory Management' 
  },
  { 
    id: 'hr', 
    name: 'HR', 
    description: 'Human Resources' 
  },
  { 
    id: 'finance', 
    name: 'Finance', 
    description: 'Financial Management' 
  },
  { 
    id: 'task', 
    name: 'Task', 
    description: 'Jira-style Task Management System' 
  },
  { 
    id: 'health', 
    name: 'Health', 
    description: 'Healthcare Management' 
  }
];

export class CompanyModuleService {
  private static companies: Company[] | null = null;
  
  /**
   * Load companies from the backend
   */
  static async loadCompanies(): Promise<Company[]> {
    if (!this.companies) {
      try {
        this.companies = await MockApiService.get<Company[]>('/companies');
      } catch (error) {
        console.error('Failed to load companies:', error);
        this.companies = [];
      }
    }
    return this.companies;
  }

  /**
   * Get a company by ID
   */
  static async getCompanyById(companyId: string): Promise<Company | null> {
    const companies = await this.loadCompanies();
    return companies.find(company => company.id === companyId) || null;
  }

  /**
   * Get all available module definitions
   */
  static getAvailableModules(): ModuleDefinition[] {
    return AVAILABLE_MODULES;
  }

  /**
   * Get enabled modules for a specific company
   */
  static getEnabledModulesForCompany(companyModules: string[]): ModuleDefinition[] {
    return AVAILABLE_MODULES.filter(module => companyModules.includes(module.id));
  }

  /**
   * Check if a company has access to a specific module
   */
  static async hasModuleAccess(companyId: string, moduleId: string): Promise<boolean> {
    const company = await this.getCompanyById(companyId);
    if (!company) return false;
    
    return company.modules.includes(moduleId);
  }

  /**
   * Validate module access for a company
   */
  static async validateModuleAccess(companyId: string | null, moduleId: string): Promise<{
    hasAccess: boolean;
    message?: string;
  }> {
    // Check if company is selected
    if (!companyId) {
      return {
        hasAccess: false,
        message: 'Please select a company first to use the system.'
      };
    }

    // Check if company exists and has access to the module
    const hasAccess = await this.hasModuleAccess(companyId, moduleId);
    
    if (!hasAccess) {
      return {
        hasAccess: false,
        message: 'You are not allowed to use this module. Please ask your administrator to enable it for your company.'
      };
    }

    return { hasAccess: true };
  }

  /**
   * Load module-specific data for a company
   */
  static async loadModuleData<T>(moduleId: string, companyId: string): Promise<T> {
    try {
      return await MockApiService.get<T>(`/${moduleId}/${companyId}`);
    } catch (error) {
      console.error(`Failed to load ${moduleId} data for company ${companyId}:`, error);
      throw new Error(`No ${moduleId} data available for this company`);
    }
  }

  /**
   * Clear cached companies (useful for refreshing data)
   */
  static clearCache(): void {
    this.companies = null;
  }
}
