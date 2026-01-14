import { NextRequest } from "next/server";
import { redirect } from "next/navigation";

interface ReqApi {
  type?: "public" | "protected"; // Disederhanakan, opsional
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
  token?: string; // Opsional jika nanti butuh token statis
  req?: NextRequest;
}

export async function fetchApi({
  url,
  method,
  body,
}: ReqApi) {
  // Pastikan variabel ini ada di file .env.local
  const baseURL = process.env.NEXT_PUBLIC_API_URL; 
  const headers = new Headers();

  const isFormData = body instanceof FormData;

  // Default header JSON kecuali FormData
  if (!isFormData) {
    headers.append("Content-Type", "application/json");
  }

  // JIKA BACKEND BUTUH TOKEN STATIS (Tanpa Login User)
  // Misalnya API Key global untuk aplikasi
  if (process.env.API_SECRET_KEY) {
     headers.append("Authorization", `Bearer ${process.env.API_SECRET_KEY}`);
  }

  try {
    const finalUrl = baseURL ? `${baseURL}${url}` : url;
    
    const response = await fetch(finalUrl, {
      method,
      headers,
      body: body
        ? isFormData
          ? body
          : JSON.stringify(body)
        : null,
      cache: 'no-store' // Agar data selalu fresh (opsional tergantung kebutuhan)
    });

    let data = null;
    try {
      data = await response.json();
    } catch {}

    if (!response.ok) {
        // Handle error umum
        return {
            status: response.status,
            message: data?.message || response.statusText,
            data
        };
    }

    return {
      status: response.status,
      message: "Success",
      data
    };

  } catch (error: any) {
    return {
        status: 500,
        message: error.message || "Internal Server Error",
        data: null
    };
  }
}