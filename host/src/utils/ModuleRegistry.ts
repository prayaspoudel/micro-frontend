import React from 'react';
import { RuntimeModuleLoader } from './RuntimeModuleLoader';

// Initialize your current modules with the runtime loader
export function initializeModuleRegistry() {
  // Register your existing modules with assets path (preview mode)
  RuntimeModuleLoader.registerModule('crm', {
    name: 'crm-app',
    url: 'http://localhost:3001/assets/remoteEntry.js',
    scope: 'crm_app',
    module: './App',
    displayName: 'CRM Module',
    description: 'Customer relationship management system',
    permissions: ['crm.read', 'crm.write']
  });

  RuntimeModuleLoader.registerModule('inventory', {
    name: 'inventory-app',
    url: 'http://localhost:3002/assets/remoteEntry.js',
    scope: 'inventory_app',
    module: './App',
    displayName: 'Inventory Module',
    description: 'Inventory management system',
    permissions: ['inventory.read', 'inventory.write']
  });

  RuntimeModuleLoader.registerModule('hr', {
    name: 'hr-app',
    url: 'http://localhost:3003/assets/remoteEntry.js',
    scope: 'hr_app',
    module: './App',
    displayName: 'HR Module',
    description: 'Human resources management system',
    permissions: ['hr.read', 'hr.write']
  });

  RuntimeModuleLoader.registerModule('finance', {
    name: 'finance-app',
    url: 'http://localhost:3004/assets/remoteEntry.js',
    scope: 'finance_app',
    module: './App',
    displayName: 'Finance Module',
    description: 'Financial management system',
    permissions: ['finance.read', 'finance.write']
  });

  RuntimeModuleLoader.registerModule('task', {
    name: 'task-app',
    url: 'http://localhost:3005/assets/remoteEntry.js',
    scope: 'task_app',
    module: './App',
    displayName: 'Task Module',
    description: 'Jira-style task and ticket management system',
    permissions: ['task.read', 'task.write']
  });

  RuntimeModuleLoader.registerModule('health', {
    name: 'health-app',
    url: 'http://localhost:3006/assets/remoteEntry.js',
    scope: 'health_app',
    module: './App',
    displayName: 'Health Module',
    description: 'Healthcare management system connected to Evero',
    permissions: ['health.read', 'health.write']
  });

  // Module registry initialized
}

// Removed unused createModuleLoader function

// Module preloader for better performance
export class ModulePreloader {
  private static preloadPromises = new Map<string, Promise<void>>();

  static async preloadModule(moduleId: string): Promise<void> {
    if (this.preloadPromises.has(moduleId)) {
      return this.preloadPromises.get(moduleId);
    }

    const preloadPromise = RuntimeModuleLoader.preloadModule(moduleId);
    this.preloadPromises.set(moduleId, preloadPromise);
    
    try {
      await preloadPromise;
      // Module preloaded successfully
    } catch (error) {
      // Failed to preload module
      this.preloadPromises.delete(moduleId);
    }
  }

  static async preloadAllModules(): Promise<void> {
    const modules = ['crm', 'inventory', 'hr', 'finance', 'task'];
    const preloadPromises = modules.map(module => this.preloadModule(module));
    
    await Promise.allSettled(preloadPromises);
    // All modules preload attempted
  }

  // Smart preloading based on user permissions
  static async preloadUserModules(userPermissions: string[]): Promise<void> {
    const availableModules = RuntimeModuleLoader.getAvailableModules();
    const allowedModules = availableModules.filter(module => 
      module.permissions.some(permission => userPermissions.includes(permission))
    );

    const preloadPromises = allowedModules.map(module => 
      this.preloadModule(module.name)
    );

    await Promise.allSettled(preloadPromises);
    // Preloaded modules based on user permissions
  }
}
