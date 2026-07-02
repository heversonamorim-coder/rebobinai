import { Body, Controller, Delete, Get, Headers, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { ZodValidationPipe } from '../../infra/zod-validation.pipe';
import {
  AddAssetDto,
  CreateGiftDto,
  UpdateGiftDto,
  addAssetSchema,
  createGiftSchema,
  updateGiftSchema,
} from './dto/gift.schemas';
import { GiftService } from './gift.service';

/**
 * API do presente (guest-first). A criação devolve o `editToken`; o cliente o
 * guarda e o envia no header `x-edit-token` para editar/ler o rascunho.
 */
@Controller('gifts')
export class GiftController {
  constructor(private readonly gifts: GiftService) {}

  @Post()
  create(@Body(new ZodValidationPipe(createGiftSchema)) dto: CreateGiftDto) {
    return this.gifts.createDraft(dto);
  }

  @Get(':id')
  get(@Param('id') id: string, @Headers('x-edit-token') editToken: string) {
    return this.gifts.getForEdit(id, editToken);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Headers('x-edit-token') editToken: string,
    @Body(new ZodValidationPipe(updateGiftSchema)) dto: UpdateGiftDto,
  ) {
    return this.gifts.update(id, editToken, dto);
  }

  @Post(':id/assets')
  addAsset(
    @Param('id') id: string,
    @Headers('x-edit-token') editToken: string,
    @Body(new ZodValidationPipe(addAssetSchema)) dto: AddAssetDto,
  ) {
    return this.gifts.addAsset(id, editToken, dto);
  }

  @Delete(':id/assets/:assetId')
  @HttpCode(200)
  removeAsset(
    @Param('id') id: string,
    @Param('assetId') assetId: string,
    @Headers('x-edit-token') editToken: string,
  ) {
    return this.gifts.removeAsset(id, editToken, assetId);
  }
}
