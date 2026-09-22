import { Test, TestingModule } from '@nestjs/testing';
import { ComunidadController } from './comunidad.controller';

describe('ComunidadController', () => {
  let controller: ComunidadController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComunidadController],
    }).compile();

    controller = module.get<ComunidadController>(ComunidadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
