/**
 * Connector Store
 * Zustand store for managing connector state
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as connectorService from '@/services/connectorService';

export const useConnectorStore = create(
  persist(
    (set, get) => ({
      // State
      connectors: [],
      selectedConnectorId: null,
      loading: false,
      error: null,
      lastFetched: null,

      // Actions
      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),

      // Fetch all connectors
      fetchConnectors: async () => {
        set({ loading: true, error: null });
        try {
          const connectors = await connectorService.listConnectors();
          set({ connectors, lastFetched: new Date() });
        } catch (error) {
          set({ error: error.message });
        } finally {
          set({ loading: false });
        }
      },

      // Get a specific connector
      getConnector: (id) => {
        return get().connectors.find((c) => c.id === id);
      },

      // Create a new connector
      createConnector: async (config) => {
        set({ loading: true, error: null });
        try {
          const newConnector = await connectorService.createConnector(config);
          set((state) => ({
            connectors: [...state.connectors, newConnector],
            selectedConnectorId: newConnector.id,
          }));
          return newConnector;
        } catch (error) {
          set({ error: error.message });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      // Update a connector
      updateConnector: async (id, updates) => {
        set({ loading: true, error: null });
        try {
          const updated = await connectorService.updateConnector(id, updates);
          set((state) => ({
            connectors: state.connectors.map((c) => (c.id === id ? updated : c)),
          }));
          return updated;
        } catch (error) {
          set({ error: error.message });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      // Delete a connector
      deleteConnector: async (id) => {
        set({ loading: true, error: null });
        try {
          await connectorService.deleteConnector(id);
          set((state) => ({
            connectors: state.connectors.filter((c) => c.id !== id),
            selectedConnectorId:
              state.selectedConnectorId === id ? null : state.selectedConnectorId,
          }));
        } catch (error) {
          set({ error: error.message });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      // Pause a connector
      pauseConnector: async (id) => {
        return get().updateConnector(id, { status: 'paused' });
      },

      // Resume a connector
      resumeConnector: async (id) => {
        return get().updateConnector(id, { status: 'healthy' });
      },

      // Select a connector
      selectConnector: (id) => {
        set({ selectedConnectorId: id });
      },

      // Get selected connector
      getSelectedConnector: () => {
        const state = get();
        if (!state.selectedConnectorId) return null;
        return state.connectors.find((c) => c.id === state.selectedConnectorId);
      },

      // Get active connectors (not paused/errored)
      getActiveConnectors: () => {
        return get().connectors.filter(
          (c) => c.status === 'healthy' || c.status === 'warning'
        );
      },

      // Get connectors by status
      getConnectorsByStatus: (status) => {
        return get().connectors.filter((c) => c.status === status);
      },

      // Get total metrics across all connectors
      getTotalMetrics: () => {
        const connectors = get().connectors;
        return {
          totalConnectors: connectors.length,
          activeConnectors: connectors.filter(
            (c) => c.status === 'healthy' || c.status === 'warning'
          ).length,
          totalRowsProcessed: connectors.reduce((sum, c) => sum + (c.metrics?.totalRowsProcessed || 0), 0),
          averageSuccessRate: connectors.length > 0
            ? connectors.reduce((sum, c) => sum + (c.metrics?.successRate || 0), 0) /
              connectors.length
            : 0,
        };
      },

      // Refresh a single connector's data
      refreshConnector: async (id) => {
        try {
          const connector = await connectorService.getConnector(id);
          set((state) => ({
            connectors: state.connectors.map((c) => (c.id === id ? connector : c)),
          }));
          return connector;
        } catch (error) {
          set({ error: error.message });
          throw error;
        }
      },

      // Clear all state
      reset: () => {
        set({
          connectors: [],
          selectedConnectorId: null,
          loading: false,
          error: null,
          lastFetched: null,
        });
      },
    }),
    {
      name: 'connector-store',
      partialize: (state) => ({
        connectors: state.connectors,
        selectedConnectorId: state.selectedConnectorId,
      }),
    }
  )
);
