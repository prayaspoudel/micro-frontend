export { apiClient, MockApiService } from './api/client';
export { CRMService, HRService, FinanceService, InventoryService } from './services/ModuleDataService';
export * from './helpers';
export { useModuleNavigate } from './hooks/useModuleNavigate';
export { useModuleMenus } from './menu/useModuleMenus';
export { menuData, getModuleMenuData, getModuleMenus } from './menu/menuData';
export type { MenuItem, ModuleMenu } from './menu/MenuAccessControl';
export type { ModuleMenuData, AllMenuData } from './menu/menuData';

// SSO exports
export * from './sso';
