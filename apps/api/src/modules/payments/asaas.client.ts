import { HttpException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Adapter do gateway Asaas (checkout transparente). Fala direto com a API REST.
 * Sem ASAAS_API_KEY o adapter lança 503 — o resto da app sobe normalmente
 * (pagamento fica "desligado" até a chave ser configurada no ambiente).
 */

export interface AsaasCustomerInput {
  name: string;
  email: string;
  cpfCnpj: string;
}

export interface AsaasCardInput {
  holderName: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  ccv: string;
}

export interface AsaasCardHolderInfo {
  name: string;
  email: string;
  cpfCnpj: string;
  postalCode: string;
  addressNumber: string;
  phone: string;
}

export interface AsaasPayment {
  id: string;
  status: string; // PENDING | RECEIVED | CONFIRMED | OVERDUE | REFUNDED | ...
  value: number;
  billingType: string;
  invoiceUrl?: string;
}

export interface AsaasPixQrCode {
  encodedImage: string; // PNG base64 (sem prefixo data:)
  payload: string; // copia-e-cola
  expirationDate?: string;
}

@Injectable()
export class AsaasClient {
  private readonly baseUrl: string;
  private readonly apiKey?: string;

  constructor(config: ConfigService) {
    this.apiKey = config.get<string>('ASAAS_API_KEY');
    const env = config.get<string>('ASAAS_ENV') ?? 'sandbox';
    this.baseUrl =
      env === 'production' ? 'https://api.asaas.com/v3' : 'https://api-sandbox.asaas.com/v3';
  }

  get enabled(): boolean {
    return Boolean(this.apiKey);
  }

  private async req<T>(path: string, init: RequestInit = {}): Promise<T> {
    if (!this.apiKey) {
      throw new ServiceUnavailableException('Pagamento indisponível: ASAAS_API_KEY não configurada.');
    }
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        'content-type': 'application/json',
        access_token: this.apiKey,
        ...(init.headers ?? {}),
      },
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : {};
    if (!res.ok) {
      const message =
        (data?.errors?.[0]?.description as string) ?? `Falha no gateway (${res.status})`;
      throw new HttpException(message, res.status);
    }
    return data as T;
  }

  createCustomer(input: AsaasCustomerInput): Promise<{ id: string }> {
    return this.req<{ id: string }>('/customers', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  /** Cobrança Pix — vencimento hoje; o QR é obtido em getPixQrCode. */
  createPixPayment(input: {
    customer: string;
    value: number;
    description: string;
    externalReference: string;
  }): Promise<AsaasPayment> {
    return this.req<AsaasPayment>('/payments', {
      method: 'POST',
      body: JSON.stringify({ ...input, billingType: 'PIX', dueDate: today() }),
    });
  }

  /** Cobrança no cartão (checkout transparente): captura imediata. */
  createCardPayment(input: {
    customer: string;
    value: number;
    description: string;
    externalReference: string;
    creditCard: AsaasCardInput;
    creditCardHolderInfo: AsaasCardHolderInfo;
    remoteIp: string;
  }): Promise<AsaasPayment> {
    return this.req<AsaasPayment>('/payments', {
      method: 'POST',
      body: JSON.stringify({ ...input, billingType: 'CREDIT_CARD', dueDate: today() }),
    });
  }

  getPixQrCode(paymentId: string): Promise<AsaasPixQrCode> {
    return this.req<AsaasPixQrCode>(`/payments/${paymentId}/pixQrCode`);
  }

  getPayment(paymentId: string): Promise<AsaasPayment> {
    return this.req<AsaasPayment>(`/payments/${paymentId}`);
  }
}

/** Data de hoje em YYYY-MM-DD (vencimento da cobrança). */
function today(): string {
  return new Date().toISOString().slice(0, 10);
}
