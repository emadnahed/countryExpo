import { apiClient, countriesApi, FIELDS } from '@/api/countriesApi';

describe('apiClient configuration', () => {
  it('uses the restcountries v3.1 base URL', () => {
    expect(apiClient.defaults.baseURL).toBe('https://restcountries.com/v3.1');
  });

  it('has a 15-second timeout', () => {
    expect(apiClient.defaults.timeout).toBe(15_000);
  });

  it('sends JSON Content-Type header', () => {
    expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
  });
});

describe('countriesApi endpoints', () => {
  let getSpy: jest.SpyInstance;

  beforeEach(() => {
    getSpy = jest.spyOn(apiClient, 'get').mockResolvedValue({ data: [] } as { data: unknown[] });
  });

  afterEach(() => {
    getSpy.mockRestore();
  });

  describe('fetchAll', () => {
    it('calls GET /all with all required fields', async () => {
      await countriesApi.fetchAll();
      expect(getSpy).toHaveBeenCalledWith(`/all?fields=${FIELDS}`);
    });

    it('requests exactly 10 fields', () => {
      const fieldsValue = FIELDS.split(',');
      expect(fieldsValue).toHaveLength(10);
    });

    it('returns the axios response', async () => {
      getSpy.mockResolvedValue({ data: [{ cca3: 'DEU' }] } as { data: { cca3: string }[] });
      const response = await countriesApi.fetchAll();
      expect(response.data).toEqual([{ cca3: 'DEU' }]);
    });
  });

  describe('fetchByCode', () => {
    it('calls GET /alpha/:code with all required fields', async () => {
      await countriesApi.fetchByCode('DEU');
      expect(getSpy).toHaveBeenCalledWith(`/alpha/DEU?fields=${FIELDS}`);
    });

    it('interpolates the code into the URL path', async () => {
      await countriesApi.fetchByCode('USA');
      expect(getSpy).toHaveBeenCalledWith(expect.stringContaining('/alpha/USA'));
    });

    it('appends the fields query parameter', async () => {
      await countriesApi.fetchByCode('GBR');
      expect(getSpy).toHaveBeenCalledWith(expect.stringContaining(`fields=${FIELDS}`));
    });
  });

  describe('fetchByCodes', () => {
    it('calls GET /alpha with comma-joined codes', async () => {
      await countriesApi.fetchByCodes(['USA', 'DEU', 'FRA']);
      expect(getSpy).toHaveBeenCalledWith(`/alpha?codes=USA,DEU,FRA&fields=${FIELDS}`);
    });

    it('works with a single code', async () => {
      await countriesApi.fetchByCodes(['GBR']);
      expect(getSpy).toHaveBeenCalledWith(expect.stringContaining('codes=GBR'));
    });

    it('appends the fields query parameter', async () => {
      await countriesApi.fetchByCodes(['DEU']);
      expect(getSpy).toHaveBeenCalledWith(expect.stringContaining(`fields=${FIELDS}`));
    });

    it('returns the axios response', async () => {
      getSpy.mockResolvedValue({ data: [{ cca3: 'DEU' }] } as { data: { cca3: string }[] });
      const response = await countriesApi.fetchByCodes(['DEU']);
      expect(response.data).toEqual([{ cca3: 'DEU' }]);
    });
  });
});
