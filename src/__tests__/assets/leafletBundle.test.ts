import {
  LEAFLET_CSS,
  LEAFLET_JS,
  MARKER_CLUSTER_CSS,
  MARKER_CLUSTER_DEFAULT_CSS,
  MARKER_CLUSTER_JS,
} from '@/assets/leafletBundle';

describe('leafletBundle exports', () => {
  describe('LEAFLET_CSS', () => {
    it('is a non-empty string', () => {
      expect(typeof LEAFLET_CSS).toBe('string');
      expect(LEAFLET_CSS.length).toBeGreaterThan(0);
    });

    it('contains CSS syntax markers', () => {
      expect(LEAFLET_CSS).toContain('{');
      expect(LEAFLET_CSS).toContain('}');
    });
  });

  describe('LEAFLET_JS', () => {
    it('is a non-empty string', () => {
      expect(typeof LEAFLET_JS).toBe('string');
      expect(LEAFLET_JS.length).toBeGreaterThan(0);
    });

    it('contains JavaScript content', () => {
      expect(LEAFLET_JS).toContain('function');
    });

    it('references Leaflet', () => {
      expect(LEAFLET_JS).toMatch(/[Ll]eaflet/);
    });
  });

  describe('MARKER_CLUSTER_CSS', () => {
    it('is a non-empty string', () => {
      expect(typeof MARKER_CLUSTER_CSS).toBe('string');
      expect(MARKER_CLUSTER_CSS.length).toBeGreaterThan(0);
    });

    it('contains CSS syntax markers', () => {
      expect(MARKER_CLUSTER_CSS).toContain('{');
    });
  });

  describe('MARKER_CLUSTER_DEFAULT_CSS', () => {
    it('is a non-empty string', () => {
      expect(typeof MARKER_CLUSTER_DEFAULT_CSS).toBe('string');
      expect(MARKER_CLUSTER_DEFAULT_CSS.length).toBeGreaterThan(0);
    });

    it('contains CSS syntax markers', () => {
      expect(MARKER_CLUSTER_DEFAULT_CSS).toContain('{');
    });
  });

  describe('MARKER_CLUSTER_JS', () => {
    it('is a non-empty string', () => {
      expect(typeof MARKER_CLUSTER_JS).toBe('string');
      expect(MARKER_CLUSTER_JS.length).toBeGreaterThan(0);
    });

    it('contains MarkerCluster reference', () => {
      expect(MARKER_CLUSTER_JS).toContain('MarkerCluster');
    });

    it('contains JavaScript content', () => {
      expect(MARKER_CLUSTER_JS).toContain('function');
    });
  });
});
