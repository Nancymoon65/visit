import { GuestbookEntry, NewEntryPayload } from '../types';
import { INITIAL_MOCK_ENTRIES } from '../constants/initialData';

export const DEFAULT_GAS_URL = 'https://script.google.com/macros/s/AKfycbymmjuxNfQI9InShWFXV5rluv03LXUmdF5Mu2ghvoW7SxZ_zYFe6R-3dkeGry55pYrOsA/exec';

const LOCAL_STORAGE_KEY = 'sheetlog_entries';
const API_URL_STORAGE_KEY = 'sheetlog_gas_url';

export function getStoredApiUrl(): string {
  try {
    const saved = localStorage.getItem(API_URL_STORAGE_KEY);
    return saved !== null ? saved : DEFAULT_GAS_URL;
  } catch {
    return DEFAULT_GAS_URL;
  }
}

export function saveStoredApiUrl(url: string): void {
  try {
    localStorage.setItem(API_URL_STORAGE_KEY, url.trim());
  } catch (err) {
    console.error('Failed to save API URL to localStorage', err);
  }
}

export function getLocalEntries(): GuestbookEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_ENTRIES));
      return INITIAL_MOCK_ENTRIES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_MOCK_ENTRIES;
  }
}

export function saveLocalEntries(entries: GuestbookEntry[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(entries));
  } catch (err) {
    console.error('Failed to save entries to localStorage', err);
  }
}

export async function fetchEntriesFromGas(apiUrl: string): Promise<GuestbookEntry[]> {
  const cleanUrl = apiUrl.trim();
  if (!cleanUrl) {
    return getLocalEntries();
  }

  // Prevent browser caching
  const separator = cleanUrl.includes('?') ? '&' : '?';
  const fetchUrl = `${cleanUrl}${separator}_t=${Date.now()}`;

  const response = await fetch(fetchUrl, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`구글 서버 응답 오류 (HTTP ${response.status})`);
  }

  const rawText = await response.text();
  let result: Record<string, unknown>;
  try {
    result = JSON.parse(rawText);
  } catch {
    if (rawText.includes('doGet') || rawText.includes('スクリプト関数')) {
      throw new Error("스크립트에 'doGet' 함수가 없습니다! 방명록 API 코드와 AI 할일 코드가 합쳐진 통합 코드로 다시 배포해 주세요.");
    }
    throw new Error("구글 서버가 유효한 JSON을 반환하지 않았습니다. (배포 권한을 '모든 사용자'로 설정했는지 확인하세요)");
  }

  if (result.status === 'error') {
    throw new Error(String(result.message || '스프레드시트에서 데이터를 읽지 못했습니다.'));
  }

  const rawList: Record<string, unknown>[] = Array.isArray(result)
    ? (result as Record<string, unknown>[])
    : Array.isArray(result.data)
    ? (result.data as Record<string, unknown>[])
    : [];

  const normalized: GuestbookEntry[] = rawList.map((item: Record<string, unknown>, index: number) => ({
    id: String(item.id || `entry_${index}_${Date.now()}`),
    name: String(item.name || '익명'),
    message: String(item.message || ''),
    tag: String(item.tag || '응원·격려'),
    timestamp: String(item.timestamp || item.date || new Date().toISOString()),
    likes: typeof item.likes === 'number' ? item.likes : 0,
  }));

  // Update local cache
  saveLocalEntries(normalized);
  return normalized;
}

export async function submitEntryToGas(
  apiUrl: string,
  payload: NewEntryPayload
): Promise<GuestbookEntry> {
  const cleanUrl = apiUrl.trim();

  // If no URL configured, save to local demo storage
  if (!cleanUrl) {
    const newEntry: GuestbookEntry = {
      id: `local_${Date.now()}`,
      name: payload.name.trim() || '익명 친구',
      message: payload.message.trim(),
      tag: payload.tag || '응원·격려',
      timestamp: new Date().toISOString(),
      likes: 0,
    };
    const current = getLocalEntries();
    const updated = [newEntry, ...current];
    saveLocalEntries(updated);
    return newEntry;
  }

  // Real Google Apps Script Web App submission
  // Note: Using 'text/plain;charset=utf-8' prevents CORS preflight OPTIONS request
  // which Google Apps Script cannot handle.
  try {
    const response = await fetch(cleanUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = await response.json().catch(() => null);
      if (data && data.status === 'error') {
        throw new Error(data.message);
      }
      return {
        id: data?.data?.id || `entry_${Date.now()}`,
        name: payload.name.trim() || '익명 친구',
        message: payload.message.trim(),
        tag: payload.tag || '응원·격려',
        timestamp: data?.data?.timestamp || new Date().toISOString(),
        likes: 0,
      };
    }
  } catch (postError) {
    console.warn('POST request failed, trying fallback GET write...', postError);
  }

  // Fallback: GET write parameter fallback for strict browser CORS environments
  try {
    const params = new URLSearchParams({
      action: 'write',
      name: payload.name.trim() || '익명 친구',
      message: payload.message.trim(),
      tag: payload.tag || '응원·격려',
      _t: String(Date.now()),
    });

    const getUrl = `${cleanUrl}${cleanUrl.includes('?') ? '&' : '?'}${params.toString()}`;
    const getRes = await fetch(getUrl, { method: 'GET' });
    if (getRes.ok) {
      const getData = await getRes.json().catch(() => null);
      return {
        id: getData?.data?.id || `entry_${Date.now()}`,
        name: payload.name.trim() || '익명 친구',
        message: payload.message.trim(),
        tag: payload.tag || '응원·격려',
        timestamp: getData?.data?.timestamp || new Date().toISOString(),
        likes: 0,
      };
    }
  } catch (getFallbackError) {
    console.error('Fallback GET also failed', getFallbackError);
  }

  // If both network routes were blocked or opaque, create optimistic entry
  const optimisticEntry: GuestbookEntry = {
    id: `opt_${Date.now()}`,
    name: payload.name.trim() || '익명 친구',
    message: payload.message.trim(),
    tag: payload.tag || '응원·격려',
    timestamp: new Date().toISOString(),
    likes: 0,
  };
  return optimisticEntry;
}

export async function testGasConnection(apiUrl: string): Promise<{ success: boolean; latencyMs: number; count?: number; message?: string }> {
  const start = performance.now();
  const cleanUrl = apiUrl.trim();

  if (!cleanUrl) {
    throw new Error('URL이 입력되지 않았습니다.');
  }

  if (!cleanUrl.startsWith('https://script.google.com/macros/s/')) {
    throw new Error('구글 앱스 스크립트 웹앱 주소 형식이 아닙니다. (https://script.google.com/macros/s/.../exec 형태여야 합니다)');
  }

  const separator = cleanUrl.includes('?') ? '&' : '?';
  const testUrl = `${cleanUrl}${separator}_test=${Date.now()}`;

  const response = await fetch(testUrl, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });

  const latency = Math.round(performance.now() - start);

  if (!response.ok) {
    throw new Error(`서버 응답 코드: ${response.status}`);
  }

  const rawText = await response.text();
  let json: Record<string, unknown>;
  try {
    json = JSON.parse(rawText);
  } catch {
    if (rawText.includes('doGet') || rawText.includes('スクリプト関数')) {
      throw new Error("스크립트에 'doGet' 함수가 없습니다! 기존 방명록 API 코드에 'AI 할일 관리' 코드가 덮어씌워진 것 같습니다.");
    }
    throw new Error("구글 서버가 유효한 JSON을 반환하지 않았습니다. (배포 권한을 '모든 사용자'로 설정했는지 확인하세요)");
  }

  if (json.status === 'error') {
    throw new Error(String(json.message || 'Apps Script 내부 실행 오류'));
  }

  return {
    success: true,
    latencyMs: latency,
    count: typeof json.count === 'number' ? json.count : (Array.isArray(json.data) ? json.data.length : 0),
    message: '정상적으로 통신되었습니다.',
  };
}
