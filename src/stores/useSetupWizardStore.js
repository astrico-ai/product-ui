/**
 * Setup Wizard Store
 * Zustand store for managing connector setup wizard state
 */

import { create } from 'zustand';

const STEPS = [
  { id: 'oauth', label: 'Connect', order: 0 },
  { id: 'schema', label: 'Schema', order: 1 },
  { id: 'sync', label: 'Sync', order: 2 },
  { id: 'review', label: 'Review', order: 3 },
  { id: 'success', label: 'Complete', order: 4 },
];

export const useSetupWizardStore = create((set, get) => ({
  // State
  currentStep: 'oauth',
  connectorTypeId: null,
  config: {
    name: '',
    email: '',
    frequency: '1h',
    historicalRange: '90d',
    tables: [],
  },
  oauthData: null,
  schemaData: null,
  validationErrors: {},
  loading: false,
  error: null,

  // Actions
  initialize: (connectorTypeId) => {
    set({
      currentStep: 'oauth',
      connectorTypeId,
      config: {
        name: '',
        email: '',
        frequency: '1h',
        historicalRange: '90d',
        tables: [],
      },
      oauthData: null,
      schemaData: null,
      validationErrors: {},
      loading: false,
      error: null,
    });
  },

  // Go to specific step
  goToStep: (stepId) => {
    const step = STEPS.find((s) => s.id === stepId);
    if (step) {
      set({ currentStep: stepId });
    }
  },

  // Go to next step
  nextStep: async () => {
    const state = get();
    const currentStepIndex = STEPS.findIndex((s) => s.id === state.currentStep);

    // Validate current step before proceeding
    const isValid = await get().validateCurrentStep();
    if (!isValid) {
      return false;
    }

    if (currentStepIndex < STEPS.length - 1) {
      const nextStepId = STEPS[currentStepIndex + 1].id;
      set({ currentStep: nextStepId });
      return true;
    }

    return false;
  },

  // Go to previous step
  previousStep: () => {
    const state = get();
    const currentStepIndex = STEPS.findIndex((s) => s.id === state.currentStep);

    if (currentStepIndex > 0) {
      const prevStepId = STEPS[currentStepIndex - 1].id;
      set({ currentStep: prevStepId });
      return true;
    }

    return false;
  },

  // Get current step info
  getCurrentStep: () => {
    return STEPS.find((s) => s.id === get().currentStep);
  },

  // Get step by id
  getStep: (stepId) => {
    return STEPS.find((s) => s.id === stepId);
  },

  // Get all steps
  getSteps: () => STEPS,

  // Update config
  updateConfig: (updates) => {
    set((state) => ({
      config: {
        ...state.config,
        ...updates,
      },
    }));
  },

  // Set OAuth data
  setOAuthData: (data) => {
    set((state) => ({
      oauthData: data,
      config: {
        ...state.config,
        email: data.email,
      },
    }));
  },

  // Set schema data
  setSchemaData: (data) => {
    set((state) => ({
      schemaData: data,
      config: {
        ...state.config,
        tables: data.selectedTables || [],
      },
    }));
  },

  // Update selected tables
  setSelectedTables: (tables) => {
    set((state) => ({
      config: {
        ...state.config,
        tables: tables,
      },
    }));
  },

  // Add validation error
  addError: (field, message) => {
    set((state) => ({
      validationErrors: {
        ...state.validationErrors,
        [field]: message,
      },
    }));
  },

  // Remove validation error
  removeError: (field) => {
    set((state) => {
      const errors = { ...state.validationErrors };
      delete errors[field];
      return { validationErrors: errors };
    });
  },

  // Clear all errors
  clearErrors: () => {
    set({ validationErrors: {} });
  },

  // Validate current step
  validateCurrentStep: async () => {
    const state = get();
    get().clearErrors();

    const currentStepId = state.currentStep;

    if (currentStepId === 'oauth') {
      if (!state.oauthData) {
        get().addError('oauth', 'Please authenticate with your account');
        return false;
      }
      return true;
    }

    if (currentStepId === 'schema') {
      if (!state.config.tables || state.config.tables.length === 0) {
        get().addError('tables', 'Please select at least one table');
        return false;
      }
      return true;
    }

    if (currentStepId === 'sync') {
      if (!state.config.name || state.config.name.trim().length === 0) {
        get().addError('name', 'Connector name is required');
        return false;
      }
      if (!state.config.frequency) {
        get().addError('frequency', 'Sync frequency is required');
        return false;
      }
      return true;
    }

    if (currentStepId === 'review') {
      // Review step is just for display, always valid
      return true;
    }

    return true;
  },

  // Get step progress (0-100)
  getProgress: () => {
    const currentIndex = STEPS.findIndex((s) => s.id === get().currentStep);
    return ((currentIndex + 1) / STEPS.length) * 100;
  },

  // Check if step is completed
  isStepCompleted: (stepId) => {
    const currentIndex = STEPS.findIndex((s) => s.id === get().currentStep);
    const stepIndex = STEPS.findIndex((s) => s.id === stepId);
    return stepIndex < currentIndex;
  },

  // Check if step is accessible (completed or current)
  isStepAccessible: (stepId) => {
    const stepIndex = STEPS.findIndex((s) => s.id === stepId);
    const currentIndex = STEPS.findIndex((s) => s.id === get().currentStep);
    return stepIndex <= currentIndex;
  },

  // Get all form data for submission
  getFormData: () => {
    const state = get();
    return {
      connectorTypeId: state.connectorTypeId,
      name: state.config.name,
      email: state.config.email,
      frequency: state.config.frequency,
      historicalRange: state.config.historicalRange,
      tables: state.config.tables,
    };
  },

  // Reset wizard
  reset: () => {
    set({
      currentStep: 'oauth',
      connectorTypeId: null,
      config: {
        name: '',
        email: '',
        frequency: '1h',
        historicalRange: '90d',
        tables: [],
      },
      oauthData: null,
      schemaData: null,
      validationErrors: {},
      loading: false,
      error: null,
    });
  },

  // Set loading state
  setLoading: (loading) => set({ loading }),

  // Set error
  setError: (error) => set({ error }),

  // Clear error
  clearError: () => set({ error: null }),
}));
