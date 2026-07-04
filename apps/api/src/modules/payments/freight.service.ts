import { BadRequestException, Injectable } from '@nestjs/common';

/**
 * Frete por CEP (Tarefa 5). O cálculo é feito no servidor por região do CEP —
 * determinístico e sem dependência externa, o que mantém o checkout resiliente.
 *
 * A primeira faixa do CEP identifica a região (padrão dos Correios), que mapeia
 * numa zona de frete. Estrutura pensada pra, no futuro, plugar a API de preços
 * dos Correios (com contrato) sem mudar o contrato deste serviço.
 */
type Zone = 'sudeste' | 'sul' | 'centro-oeste' | 'nordeste' | 'norte';

@Injectable()
export class FreightService {
  /** Frete por zona, em centavos. Valores de partida — ajustáveis. */
  private static readonly ZONE_PRICE: Record<Zone, number> = {
    sudeste: 1990,
    sul: 2490,
    'centro-oeste': 2990,
    nordeste: 3290,
    norte: 3990,
  };

  private static readonly ZONE_LABEL: Record<Zone, string> = {
    sudeste: 'Sudeste',
    sul: 'Sul',
    'centro-oeste': 'Centro-Oeste',
    nordeste: 'Nordeste',
    norte: 'Norte',
  };

  /** Normaliza "12345-678" / "12345678" → 8 dígitos, ou lança 400. */
  static normalizeCep(cep: string): string {
    const digits = (cep || '').replace(/\D/g, '');
    if (digits.length !== 8) throw new BadRequestException('CEP inválido — informe 8 dígitos.');
    return digits;
  }

  /** Região pela 1ª faixa do CEP (regra dos Correios). */
  private static region(cep8: string): Zone {
    switch (cep8[0]) {
      case '0':
      case '1':
      case '2':
      case '3':
        return 'sudeste';
      case '8':
      case '9':
        return 'sul';
      case '7':
        return 'centro-oeste';
      case '4':
      case '5':
        return 'nordeste';
      default: // '6'
        return 'norte';
    }
  }

  /** Custo do frete (centavos) + rótulo da região, a partir do CEP. */
  quote(cep: string): { cep: string; region: string; cost: number } {
    const cep8 = FreightService.normalizeCep(cep);
    const zone = FreightService.region(cep8);
    return {
      cep: cep8,
      region: FreightService.ZONE_LABEL[zone],
      cost: FreightService.ZONE_PRICE[zone],
    };
  }
}
