
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3100/api/v1";

/**
 * Universal fetch wrapper giúp tích hợp các quy chuẩn gửi request an toàn.
 * - Tự động include cookie
 * - Gắn base URL
 * - Handle lỗi HTTP ở mức thấp
 */
export const fetchWrapper = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint}`;

  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include", 
  };

  let response: Response;
  try {
    response = await fetch(url, config);
  } catch (error:any) {
    if (error.name === "AbortError") throw error;
    // Lỗi mạng hoặc block
    return Promise.reject({ status: 0, error: "Lỗi kết nối mạng", original: error });
  }

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    // Tự động quăng lỗi cho Repository layer xử lý
    return Promise.reject({ 
      status: response.status, 
      message: data?.message || data?.error || "Có lỗi xảy ra", 
      data 
    });
  }

  return data as T;
};
