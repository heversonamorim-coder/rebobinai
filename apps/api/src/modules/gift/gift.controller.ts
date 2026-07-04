import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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

  @Post(':id/assets/upload')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  uploadImage(
    @Param('id') id: string,
    @Headers('x-edit-token') editToken: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Arquivo ausente');
    if (!file.mimetype?.startsWith('image/')) {
      throw new BadRequestException('Envie um arquivo de imagem');
    }
    return this.gifts.uploadImageAsset(id, editToken, file.buffer);
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
