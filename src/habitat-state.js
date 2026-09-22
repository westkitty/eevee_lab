/* ==========================================================================
   HABITAT WORLD STATE — Phase 5 semantic persistence for room history,
   bounded narrative progression, placeable transforms and trace provenance.
   Scene graphs are never serialized.
   ========================================================================== */
(function (global) {
  'use strict';

  const HABITAT_ROOMS = Object.freeze([
    'eevee', 'vaporeon', 'jolteon', 'flareon', 'espeon',
    'umbreon', 'leafeon', 'glaceon', 'sylveon'
  ]);

  const NARRATIVE_STAGES = Object.freeze({
    conservatory: [
      { id: 'quiet', label: 'Quiet Archive' },
      { id: 'mapped', label: 'House Taking Shape' },
      { id: 'inhabited', label: 'Shared Habitat' },
      { id: 'living-archive', label: 'Living Archive' }
    ],
    eevee: [
      { id: 'unchosen', label: 'Unchosen' },
      { id: 'studied', label: 'Studied Possibilities' },
      { id: 'annotated', label: 'Paths Compared' },
      { id: 'claimed', label: 'A Room With History' }
    ],
    vaporeon: [
      { id: 'still', label: 'Still Grotto' },
      { id: 'damp', label: 'Water Stirred' },
      { id: 'tideglass', label: 'Tideglass Awake' },
      { id: 'flood-memory', label: 'Flood Memory' }
    ],
    jolteon: [
      { id: 'dead', label: 'Relay Dead' },
      { id: 'partial', label: 'Partially Charged' },
      { id: 'restored', label: 'Relay Restored' },
      { id: 'overloaded', label: 'Controlled Overload' }
    ],
    flareon: [
      { id: 'cold', label: 'Observation Chamber' },
      { id: 'warmed', label: 'Hearth Rekindled' },
      { id: 'nested', label: 'Made Into a Den' },
      { id: 'kept-warm', label: 'Kept Warm' }
    ],
    espeon: [
      { id: 'silent', label: 'Silent Observatory' },
      { id: 'aligned', label: 'Objects Realigned' },
      { id: 'predictive', label: 'Patterns Emerging' },
      { id: 'anticipated', label: 'Already Expected' }
    ],
    umbreon: [
      { id: 'dim', label: 'Eyes Adjusting' },
      { id: 'watched', label: 'Moon Dial Watched' },
      { id: 'night-garden', label: 'Garden Remembered' },
      { id: 'deep-watch', label: 'Deep Watch' }
    ],
    leafeon: [
      { id: 'contained', label: 'Contained Growth' },
      { id: 'sprouting', label: 'New Growth' },
      { id: 'overgrown', label: 'Glasshouse Reclaimed' },
      { id: 'self-tending', label: 'Self-Tending Garden' }
    ],
    glaceon: [
      { id: 'catalogue', label: 'Catalogue Gallery' },
      { id: 'frosted', label: 'Frost Taking Hold' },
      { id: 'crystalline', label: 'Crystalline Gallery' },
      { id: 'preserved', label: 'Preserved in Ice' }
    ],
    sylveon: [
      { id: 'prepared', label: 'Prepared for Visitors' },
      { id: 'connected', label: 'Connections Made' },
      { id: 'gathered', label: 'Keepsakes Gathered' },
      { id: 'welcoming', label: 'A Room That Welcomes Back' }
    ]
  });

  const TRACE_KIND_BY_ROOM = Object.freeze({
    eevee: 'notebook',
    vaporeon: 'shell',
    jolteon: 'tag',
    flareon: 'frame',
    espeon: 'tag',
    umbreon: 'ribbon',
    leafeon: 'notebook',
    glaceon: 'tag',
    sylveon: 'ribbon'
  });

  function isObject(v) { return !!v && typeof v === 'object' && !Array.isArray(v); }
  function clampInt(v, min, max) {
    const n = Math.floor(Number(v) || 0);
    return Math.max(min, Math.min(max, n));
  }
  function firstDetailKey(detail) {
    if (!isObject(detail)) return 'event';
    const keys = Object.keys(detail).sort();
    if (!keys.length) return 'event';
    const key = keys[0];
    const value = detail[key];
    if (typeof value === 'string' || typeof value === 'number') return key + '-' + String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 24);
    return key;
  }
  function legacyTraceKind(destinationRoom) {
    const idx = Math.max(0, HABITAT_ROOMS.indexOf(destinationRoom));
    return ['ribbon', 'shell', 'tag'][idx % 3];
  }

  class HabitatWorldState {
    constructor(save) {
      if (!save) throw new Error('HabitatWorldState requires SaveManager');
      this.save = save;
      this._ensureShape();
    }

    _ensureShape() {
      if (!isObject(this.save.get('roomNarrative', null))) this.save.set('roomNarrative', {});
      if (!isObject(this.save.get('placedObjects', null))) this.save.set('placedObjects', {});
      if (!isObject(this.save.get('abilityMutations', null))) this.save.set('abilityMutations', {});
      const raw = this.save.get('crossContamination', {});
      const normalized = {};
      let changed = !isObject(raw);
      const source = isObject(raw) ? raw : {};
      Object.keys(source).forEach(destinationRoom => {
        const items = Array.isArray(source[destinationRoom]) ? source[destinationRoom] : [];
        normalized[destinationRoom] = items.slice(-4).map(item => {
          if (isObject(item) && item.id) {
            return {
              id: String(item.id),
              originRoom: item.originRoom || 'legacy',
              originEvent: item.originEvent || 'legacy',
              objectType: item.objectType || legacyTraceKind(destinationRoom),
              destinationRoom: item.destinationRoom || destinationRoom
            };
          }
          changed = true;
          return {
            id: String(item),
            originRoom: 'legacy',
            originEvent: 'legacy-threshold',
            objectType: legacyTraceKind(destinationRoom),
            destinationRoom
          };
        });
      });
      if (changed || JSON.stringify(source) !== JSON.stringify(normalized)) this.save.set('crossContamination', normalized);
    }

    _roomRecord(roomId) {
      const all = this.save.get('roomNarrative', {});
      const existing = isObject(all[roomId]) ? all[roomId] : {};
      return {
        visits: clampInt(existing.visits, 0, 99),
        propUses: clampInt(existing.propUses, 0, 8),
        mementos: isObject(existing.mementos) ? Object.assign({}, existing.mementos) : {},
        stageIndex: clampInt(existing.stageIndex, 0, 3)
      };
    }

    _writeRoomRecord(roomId, record) {
      const all = Object.assign({}, this.save.get('roomNarrative', {}));
      all[roomId] = {
        visits: clampInt(record.visits, 0, 99),
        propUses: clampInt(record.propUses, 0, 8),
        mementos: Object.assign({}, record.mementos || {}),
        stageIndex: clampInt(record.stageIndex, 0, 3)
      };
      this.save.set('roomNarrative', all);
      return all[roomId];
    }

    noteVisit(roomId) {
      const record = this._roomRecord(roomId);
      record.visits = Math.min(99, record.visits + 1);
      record.stageIndex = this._computeStageIndex(roomId, record);
      this._writeRoomRecord(roomId, record);
      return this.getRoomState(roomId);
    }

    noteRoomEvent(roomId, eventType, detail) {
      const record = this._roomRecord(roomId);
      if (eventType === 'roomProp') record.propUses = Math.min(8, record.propUses + 1);
      if (eventType === 'memento') {
        const id = detail && detail.id ? String(detail.id) : firstDetailKey(detail);
        record.mementos[id] = true;
      }
      record.stageIndex = this._computeStageIndex(roomId, record);
      this._writeRoomRecord(roomId, record);
      if (roomId !== 'conservatory' && (eventType === 'roomProp' || eventType === 'memento')) {
        this._seedTrace(roomId, eventType, detail, record.propUses + Object.keys(record.mementos).length);
      }
      return this.getRoomState(roomId);
    }

    _computeStageIndex(roomId, record) {
      const stages = NARRATIVE_STAGES[roomId] || NARRATIVE_STAGES.conservatory;
      if (roomId === 'conservatory') {
        const visited = HABITAT_ROOMS.filter(id => this._roomRecord(id).visits > 0).length;
        if (visited >= 9) return Math.min(stages.length - 1, 3);
        if (visited >= 6) return Math.min(stages.length - 1, 2);
        if (visited >= 3) return Math.min(stages.length - 1, 1);
        return 0;
      }
      const visitProgress = record.visits >= 3 ? 1 : 0;
      const score = visitProgress + Math.min(2, record.propUses) + (Object.keys(record.mementos).length ? 1 : 0);
      return Math.min(stages.length - 1, score);
    }

    getRoomState(roomId) {
      const stages = NARRATIVE_STAGES[roomId] || NARRATIVE_STAGES.conservatory;
      const record = this._roomRecord(roomId);
      const computed = this._computeStageIndex(roomId, record);
      if (record.stageIndex !== computed) {
        record.stageIndex = computed;
        this._writeRoomRecord(roomId, record);
      }
      const stage = stages[computed] || stages[0];
      return {
        roomId,
        visits: record.visits,
        propUses: record.propUses,
        mementoCount: Object.keys(record.mementos).length,
        stageIndex: computed,
        stageId: stage.id,
        label: stage.label,
        stageCount: stages.length
      };
    }

    savePlacement(roomId, objectId, transform) {
      if (!roomId || !objectId || !transform) return null;
      const all = Object.assign({}, this.save.get('placedObjects', {}));
      const room = Object.assign({}, all[roomId] || {});
      const position = transform.position || transform;
      room[objectId] = {
        x: Number(position.x) || 0,
        y: Number(position.y) || 0,
        z: Number(position.z) || 0,
        ry: Number(transform.ry != null ? transform.ry : (transform.rotationY || 0)) || 0
      };
      const keys = Object.keys(room);
      if (keys.length > 24) delete room[keys[0]];
      all[roomId] = room;
      this.save.set('placedObjects', all);
      return room[objectId];
    }

    getPlacement(roomId, objectId) {
      const room = this.save.get('placedObjects.' + roomId, {});
      const value = room && room[objectId];
      return isObject(value) ? Object.assign({}, value) : null;
    }

    listPlacements(roomId) {
      const room = this.save.get('placedObjects.' + roomId, {});
      return isObject(room) ? Object.assign({}, room) : {};
    }

    recordAbilityMutation(roomId, targetId, mutation) {
      if (!roomId || !targetId || !isObject(mutation)) return null;
      const all = Object.assign({}, this.save.get('abilityMutations', {}));
      const room = Object.assign({}, all[roomId] || {});
      room[targetId] = {
        roomId,
        targetId,
        species: String(mutation.species || ''),
        abilityId: String(mutation.abilityId || ''),
        targetType: String(mutation.targetType || ''),
        mutation: String(mutation.mutation || '')
      };
      all[roomId] = room;
      this.save.set('abilityMutations', all);
      return Object.assign({}, room[targetId]);
    }

    getAbilityMutation(roomId, targetId) {
      const room = this.save.get('abilityMutations.' + roomId, {});
      const value = room && room[targetId];
      return isObject(value) ? Object.assign({}, value) : null;
    }

    listAbilityMutations(roomId) {
      const room = this.save.get('abilityMutations.' + roomId, {});
      if (!isObject(room)) return [];
      return Object.keys(room).sort().map(id => Object.assign({}, room[id]));
    }

    listTraces(destinationRoom) {
      const raw = this.save.get('crossContamination.' + destinationRoom, []);
      return Array.isArray(raw) ? raw.filter(isObject).map(item => Object.assign({}, item)) : [];
    }

    _seedTrace(originRoom, eventType, detail, serial) {
      const originIndex = HABITAT_ROOMS.indexOf(originRoom);
      if (originIndex < 0) return null;
      const offset = 1 + (Math.max(1, serial) % 3);
      const destinationRoom = HABITAT_ROOMS[(originIndex + offset) % HABITAT_ROOMS.length];
      const eventKey = firstDetailKey(detail);
      const id = ['trace', originRoom, eventType, eventKey, destinationRoom].join('_');
      const all = Object.assign({}, this.save.get('crossContamination', {}));
      const list = Array.isArray(all[destinationRoom]) ? all[destinationRoom].slice() : [];
      const existing = list.find(item => isObject(item) && item.id === id);
      if (existing) return existing;
      const trace = {
        id,
        originRoom,
        originEvent: eventType + ':' + eventKey,
        objectType: TRACE_KIND_BY_ROOM[originRoom] || 'tag',
        destinationRoom
      };
      list.push(trace);
      if (list.length > 4) list.splice(0, list.length - 4);
      all[destinationRoom] = list;
      this.save.set('crossContamination', all);
      return trace;
    }

    getHistorySummary() {
      const visitedRooms = HABITAT_ROOMS.filter(id => this._roomRecord(id).visits > 0);
      const advancedRooms = HABITAT_ROOMS.filter(id => this.getRoomState(id).stageIndex > 0);
      const mementos = this.save.get('discovery.mementos', {});
      const traceRoot = this.save.get('crossContamination', {});
      let traceCount = 0;
      if (isObject(traceRoot)) Object.values(traceRoot).forEach(list => { if (Array.isArray(list)) traceCount += list.length; });
      return {
        visitedRooms,
        visitedCount: visitedRooms.length,
        advancedRooms,
        advancedCount: advancedRooms.length,
        mementoCount: isObject(mementos) ? Object.keys(mementos).length : 0,
        traceCount,
        conservatoryState: this.getRoomState('conservatory')
      };
    }

    getDebugState(roomId) {
      return {
        room: this.getRoomState(roomId || 'conservatory'),
        placements: this.listPlacements(roomId || 'conservatory'),
        abilities: this.listAbilityMutations(roomId || 'conservatory'),
        traces: this.listTraces(roomId || 'conservatory'),
        history: this.getHistorySummary()
      };
    }
  }

  global.HabitatWorldStateSystem = {
    HABITAT_ROOMS,
    NARRATIVE_STAGES,
    TRACE_KIND_BY_ROOM,
    HabitatWorldState
  };
})(window);
