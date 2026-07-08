import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "./AuthContext";

const SquadContext = createContext(null);

const ACTIVE_SQUAD_KEY = "activeSquadId";

export function SquadProvider({ children }) {
  const { user } = useAuth();
  const params = useParams();
  const [squads, setSquads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSquadId, setActiveSquadIdState] = useState(
    () => localStorage.getItem(ACTIVE_SQUAD_KEY) || null
  );

  const setActiveSquadId = (id) => {
    setActiveSquadIdState(id);
    if (id) {
      localStorage.setItem(ACTIVE_SQUAD_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_SQUAD_KEY);
    }
  };

  const loadSquads = useCallback(async () => {
    if (!user) {
      setSquads([]);
      setLoading(false);
      return;
    }
    try {
      const res = await api.get("/squad/my");
      const list = res.data.squads || [];
      setSquads(list);

      const routeSquadId = params.squadId;
      if (routeSquadId && list.some((s) => s._id === routeSquadId)) {
        setActiveSquadId(routeSquadId);
      } else if (!list.some((s) => s._id === activeSquadId)) {
        setActiveSquadId(list[0]?._id || null);
      }
    } catch (err) {
      console.error("[SquadContext] Failed to load squads:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, params.squadId]);

  useEffect(() => {
    loadSquads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (params.squadId && params.squadId !== activeSquadId) {
      setActiveSquadId(params.squadId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.squadId]);

  const activeSquad = squads.find((s) => s._id === activeSquadId) || null;

  return (
    <SquadContext.Provider
      value={{ squads, loading, activeSquadId, activeSquad, setActiveSquadId, refreshSquads: loadSquads }}
    >
      {children}
    </SquadContext.Provider>
  );
}

export function useSquads() {
  const ctx = useContext(SquadContext);
  if (!ctx) throw new Error("useSquads must be used within SquadProvider");
  return ctx;
}