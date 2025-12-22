/**
 * Sync Store
 * Zustand store for managing sync state and progress
 */

import { create } from 'zustand';
import * as connectorService from '@/services/connectorService';

export const useSyncStore = create((set, get) => ({
  // State
  activeSyncs: {}, // { connectorId: { id, status, progress, tables, startTime, estimatedEndTime } }
  syncHistory: {},
  pausedSyncs: new Set(),
  loading: false,
  error: null,
  syncIntervals: {}, // Track setInterval IDs for cleanup

  // Actions
  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  // Start a new sync
  startSync: async (connectorId) => {
    set({ loading: true, error: null });
    try {
      const syncResponse = await connectorService.triggerSync(connectorId);

      // Initialize active sync with mock progress data
      const mockSync = {
        id: syncResponse.syncId,
        connectorId,
        status: 'in_progress',
        progress: 0,
        startTime: new Date(),
        estimatedEndTime: new Date(Date.now() + 15 * 60 * 1000), // 15 min estimate
        tables: [
          { name: 'campaigns', status: 'pending', progress: 0, rowsProcessed: 0 },
          { name: 'ad_groups', status: 'pending', progress: 0, rowsProcessed: 0 },
          { name: 'keywords', status: 'pending', progress: 0, rowsProcessed: 0 },
          { name: 'ad_performance', status: 'pending', progress: 0, rowsProcessed: 0 },
          { name: 'conversions', status: 'pending', progress: 0, rowsProcessed: 0 },
        ],
      };

      set((state) => ({
        activeSyncs: {
          ...state.activeSyncs,
          [connectorId]: mockSync,
        },
      }));

      // Start progress simulation
      get().simulateSyncProgress(connectorId);

      return mockSync;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Simulate sync progress (updates every 1 second)
  simulateSyncProgress: (connectorId) => {
    const existingInterval = get().syncIntervals[connectorId];
    if (existingInterval) {
      clearInterval(existingInterval);
    }

    const interval = setInterval(() => {
      set((state) => {
        const sync = state.activeSyncs[connectorId];
        if (!sync) {
          clearInterval(interval);
          return state;
        }

        // Skip if paused
        if (state.pausedSyncs.has(connectorId)) {
          return state;
        }

        // Simulate completion
        const elapsedSeconds = (Date.now() - sync.startTime) / 1000;
        const totalDuration = 900; // 15 minutes total
        const newProgress = Math.min(100, (elapsedSeconds / totalDuration) * 100);

        // Simulate table progression
        const newTables = sync.tables.map((table, idx) => {
          if (newProgress < 20) {
            // First 20%: complete campaigns
            if (idx === 0) {
              return { ...table, status: 'complete', progress: 100, rowsProcessed: 42450 };
            }
            return table;
          } else if (newProgress < 70) {
            // 20-70%: complete campaigns, process ad_groups
            if (idx === 0) {
              return { ...table, status: 'complete', progress: 100, rowsProcessed: 42450 };
            } else if (idx === 1) {
              const tableProgress = Math.min(100, ((newProgress - 20) / 50) * 100);
              return {
                ...table,
                status: 'in_progress',
                progress: tableProgress,
                rowsProcessed: Math.floor(38150 * (tableProgress / 100)),
              };
            }
            return table;
          } else if (newProgress < 100) {
            // 70-100%: campaigns complete, ad_groups complete, keywords
            if (idx === 0) {
              return { ...table, status: 'complete', progress: 100, rowsProcessed: 42450 };
            } else if (idx === 1) {
              return { ...table, status: 'complete', progress: 100, rowsProcessed: 38150 };
            } else if (idx === 2) {
              const tableProgress = Math.min(100, ((newProgress - 70) / 30) * 100);
              return {
                ...table,
                status: 'in_progress',
                progress: tableProgress,
                rowsProcessed: Math.floor(126500 * (tableProgress / 100)),
              };
            }
            return table;
          } else {
            // Complete
            if (idx <= 2) {
              return {
                ...table,
                status: 'complete',
                progress: 100,
                rowsProcessed:
                  idx === 0 ? 42450 : idx === 1 ? 38150 : 126500,
              };
            }
            return table;
          }
        });

        // Check if sync is complete
        if (newProgress >= 100) {
          clearInterval(interval);
          return {
            ...state,
            activeSyncs: {
              ...state.activeSyncs,
              [connectorId]: {
                ...sync,
                progress: 100,
                status: 'complete',
                tables: newTables,
                endTime: new Date(),
              },
            },
            syncIntervals: {
              ...state.syncIntervals,
              [connectorId]: null,
            },
          };
        }

        return {
          ...state,
          activeSyncs: {
            ...state.activeSyncs,
            [connectorId]: {
              ...sync,
              progress: Math.round(newProgress),
              tables: newTables,
            },
          },
        };
      });
    }, 1000);

    set((state) => ({
      syncIntervals: {
        ...state.syncIntervals,
        [connectorId]: interval,
      },
    }));
  },

  // Pause a sync
  pauseSync: async (connectorId, syncId) => {
    try {
      await connectorService.pauseSync(connectorId, syncId);
      set((state) => ({
        activeSyncs: {
          ...state.activeSyncs,
          [connectorId]: {
            ...state.activeSyncs[connectorId],
            status: 'paused',
          },
        },
        pausedSyncs: new Set([...state.pausedSyncs, connectorId]),
      }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // Resume a paused sync
  resumeSync: async (connectorId, syncId) => {
    try {
      await connectorService.resumeSync(connectorId, syncId);
      set((state) => {
        const newPaused = new Set(state.pausedSyncs);
        newPaused.delete(connectorId);
        return {
          activeSyncs: {
            ...state.activeSyncs,
            [connectorId]: {
              ...state.activeSyncs[connectorId],
              status: 'in_progress',
            },
          },
          pausedSyncs: newPaused,
        };
      });
      get().simulateSyncProgress(connectorId);
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // Get active sync for a connector
  getActiveSync: (connectorId) => {
    return get().activeSyncs[connectorId];
  },

  // Get all active syncs
  getAllActiveSyncs: () => {
    return Object.values(get().activeSyncs);
  },

  // Check if a sync is paused
  isSyncPaused: (connectorId) => {
    return get().pausedSyncs.has(connectorId);
  },

  // Complete a sync (move to history)
  completeSync: (connectorId) => {
    const state = get();
    const activeSync = state.activeSyncs[connectorId];

    if (!activeSync) return;

    const completedSync = {
      ...activeSync,
      status: 'success',
      endTime: new Date(),
      duration: Math.floor(
        (new Date() - activeSync.startTime) / 1000
      ), // Duration in seconds
    };

    // Clear interval
    const interval = state.syncIntervals[connectorId];
    if (interval) {
      clearInterval(interval);
    }

    set((state) => {
      const history = state.syncHistory[connectorId] || [];
      return {
        activeSyncs: {
          ...state.activeSyncs,
          [connectorId]: undefined,
        },
        syncHistory: {
          ...state.syncHistory,
          [connectorId]: [completedSync, ...history].slice(0, 50), // Keep last 50
        },
        syncIntervals: {
          ...state.syncIntervals,
          [connectorId]: null,
        },
      };
    });
  },

  // Cancel a sync
  cancelSync: (connectorId) => {
    const state = get();
    const interval = state.syncIntervals[connectorId];

    if (interval) {
      clearInterval(interval);
    }

    set((state) => ({
      activeSyncs: {
        ...state.activeSyncs,
        [connectorId]: undefined,
      },
      pausedSyncs: (() => {
        const newPaused = new Set(state.pausedSyncs);
        newPaused.delete(connectorId);
        return newPaused;
      })(),
      syncIntervals: {
        ...state.syncIntervals,
        [connectorId]: null,
      },
    }));
  },

  // Get sync history for a connector
  getSyncHistory: (connectorId) => {
    return get().syncHistory[connectorId] || [];
  },

  // Get all sync history
  getAllSyncHistory: () => {
    return get().syncHistory;
  },

  // Clear a connector's sync history
  clearSyncHistory: (connectorId) => {
    set((state) => ({
      syncHistory: {
        ...state.syncHistory,
        [connectorId]: [],
      },
    }));
  },

  // Cleanup on unmount
  cleanup: () => {
    const state = get();
    Object.values(state.syncIntervals).forEach((interval) => {
      if (interval) clearInterval(interval);
    });
    set({
      activeSyncs: {},
      pausedSyncs: new Set(),
      syncIntervals: {},
    });
  },
}));
