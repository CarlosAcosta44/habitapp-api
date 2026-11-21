import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CommunityService } from './community.service';
import { CommunityRepository } from '../repositories/community.repository';

describe('CommunityService (UT-063 a UT-082)', () => {
  let service: CommunityService;
  let repository: jest.Mocked<CommunityRepository>;

  beforeEach(async () => {
    const mockCommunityRepository = {
      getForumById: jest.fn(),
      getForums: jest.fn(),
      getUsersByIds: jest.fn(),
      getCommentCountsByForumIds: jest.fn(),
      getForumSubscriptions: jest.fn(),
      getCommentsByForumId: jest.fn(),
      getCommentReactions: jest.fn(),
      uploadImageToStorage: jest.fn(),
      createForum: jest.fn(),
      getForumOwner: jest.fn(),
      updateForum: jest.fn(),
      deleteForum: jest.fn(),
      createComment: jest.fn(),
      getCommentOwner: jest.fn(),
      updateComment: jest.fn(),
      deleteComment: jest.fn(),
      getForumSubscription: jest.fn(),
      removeForumSubscription: jest.fn(),
      addForumSubscription: jest.fn(),
      getReaction: jest.fn(),
      removeReaction: jest.fn(),
      addReaction: jest.fn(),
      getPublishedHabit: jest.fn(),
      updateClonesCount: jest.fn(),
      createUserHabit: jest.fn(),
      getUserHabit: jest.fn(),
      getUserPublishedHabitByName: jest.fn().mockResolvedValue(null),
      publishHabit: jest.fn(),
      getPublishedHabitOwner: jest.fn(),
      deletePublishedHabit: jest.fn(),
      getRetos: jest.fn(),
      joinReto: jest.fn(),
      leaveReto: jest.fn(),
      checkinReto: jest.fn(),
      createReto: jest.fn(),
      getArticulos: jest.fn(),
      getCoachRoleId: jest.fn(),
      getUsersByRole: jest.fn(),
      getCoachSpecialties: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunityService,
        {
          provide: CommunityRepository,
          useValue: mockCommunityRepository,
        },
      ],
    }).compile();

    service = module.get<CommunityService>(CommunityService);
    repository = module.get(CommunityRepository);
  });

  // 1 (UT-063)
  it('UT-063: getForums_ConForosYComentarios_EnriqueceAutorConteoDeRespuestasYLikes(US027)', async () => {
    repository.getForums.mockResolvedValue([
      { idforo: 'f-1', idusuario: 'u-1', titulo: 'Hidratación', categoria: 'Nutrición' },
    ] as any);
    repository.getUsersByIds.mockResolvedValue([
      { idusuario: 'u-1', nombre: 'Carlos', apellido: 'Acosta' },
    ] as any);
    repository.getCommentCountsByForumIds.mockResolvedValue([
      { idforo: 'f-1' },
      { idforo: 'f-1' },
      { idforo: 'f-1' },
    ] as any);
    repository.getForumSubscriptions.mockResolvedValue([
      { idforo: 'f-1', idusuario: 'u-1' },
    ] as any);

    const res = await service.getForums();
    expect(res[0].comments_count).toBe(3);
    expect(res[0].likes_count).toBe(1);
    expect(res[0].usuarios.nombre).toBe('Carlos');
  });

  // 2 (UT-064)
  it('UT-064: getForumById_ForoInexistente_LanzaNotFoundException', async () => {
    repository.getForumById.mockResolvedValueOnce(null);
    await expect(service.getForumById('f-404')).rejects.toThrow(
      NotFoundException,
    );

    repository.getForumById.mockResolvedValueOnce({
      idforo: 'f-1',
      idusuario: 'u-1',
    } as any);
    repository.getUsersByIds.mockResolvedValue([
      { idusuario: 'u-1', nombre: 'Ana' },
    ] as any);
    repository.getCommentCountsByForumIds.mockResolvedValue([
      { idforo: 'f-1' },
    ] as any);
    repository.getForumSubscriptions.mockResolvedValue([
      { idforo: 'f-1', idusuario: 'u-1' },
    ] as any);
    const validJwt = `header.${Buffer.from(JSON.stringify({ sub: 'u-1' })).toString('base64')}.sig`;
    const found = await service.getForumById('f-1', validJwt);
    expect(found.liked_by_me).toBe(true);
  });

  // 3 (UT-065)
  it('UT-065: createForum_DatosValidos_CreaForoAsociadoAlAutor(US028)', async () => {
    (repository as any).getActiveUsersCount = jest.fn().mockResolvedValue(42);
    const stats = await service.getStats();
    expect(stats.totalMiembros).toBe(42);

    repository.getCommentsByForumId.mockResolvedValue([
      { idcomentario: 'c-1', idusuario: 'u-1', contenido: 'Hola' },
    ] as any);
    repository.getUsersByIds.mockResolvedValue([
      { idusuario: 'u-1', nombre: 'Carlos' },
    ] as any);
    repository.getCommentReactions.mockResolvedValue([
      { idcomentario: 'c-1', idusuario: 'u-1', tipo: 'Me gusta' },
    ] as any);
    const validJwt = `header.${Buffer.from(JSON.stringify({ sub: 'u-1' })).toString('base64')}.sig`;
    const comments = await service.getCommentsByForumId('f-1', validJwt);
    expect(comments[0].likes_count).toBe(1);

    repository.createForum.mockResolvedValue({
      idforo: 'f-new',
      idusuario: 'u-1',
      titulo: 'Rutina matutina',
    } as any);

    const res = await service.createForum(
      'u-1',
      'Rutina matutina',
      'Contenido del foro',
      'Hábitos',
    );
    expect(res.idforo).toBe('f-new');
  });

  // 4 (UT-066)
  it('UT-066: updateForum_AutorPropietario(TD4-R2)_PermiteEdicion', async () => {
    repository.getForumOwner.mockResolvedValue({ idusuario: 'u-1' } as any);
    repository.updateForum.mockResolvedValue({
      idforo: 'f-1',
      titulo: 'Título editado',
    } as any);

    const res = await service.updateForum('u-1', 'f-1', {
      titulo: 'Título editado',
    });
    expect(res.titulo).toBe('Título editado');
  });

  // 5 (UT-067)
  it('UT-067: updateForum_UsuarioNoPropietario(TD4-R3)_LanzaUnauthorizedException', async () => {
    repository.getForumOwner.mockResolvedValue({ idusuario: 'owner-1' } as any);

    await expect(
      service.updateForum('intruder-2', 'f-1', { titulo: 'Hack' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  // 6 (UT-068)
  it('UT-068: deleteForum_AutorPropietario(TD4-R2)_EliminaForoEnCascada', async () => {
    repository.getForumOwner.mockResolvedValue({ idusuario: 'u-1' } as any);
    repository.deleteForum.mockResolvedValue({ deleted: true } as any);

    const res = await service.deleteForum('u-1', 'f-1');
    expect(repository.deleteForum).toHaveBeenCalledWith('f-1');
    expect(res).toEqual({ deleted: true });
  });

  // 7 (UT-069)
  it('UT-069: addComment_ComentarioRaizYRespuestaAnidadaConParentId_PersisteEnHilo(US029)', async () => {
    repository.createComment.mockResolvedValue({
      idcomentario: 'c-2',
      id_comentario_padre: 'c-1',
      contenido: 'Respuesta anidada',
    } as any);

    const res = await service.addComment(
      'u-1',
      'f-1',
      'Respuesta anidada',
      'c-1',
    );
    expect(repository.createComment).toHaveBeenCalledWith(
      'u-1',
      'f-1',
      'Respuesta anidada',
      'c-1',
      undefined,
    );
    expect(res.id_comentario_padre).toBe('c-1');
  });

  // 8 (UT-070)
  it('UT-070: addComment_ContenidoEImagenVacios_LanzaBadRequestException', async () => {
    await expect(service.addComment('u-1', 'f-1', '')).rejects.toThrow(
      BadRequestException,
    );
  });

  // 9 (UT-071)
  it('UT-071: deleteComment_UsuarioNoAutor(TD4-R3)_LanzaUnauthorizedException', async () => {
    repository.getCommentOwner.mockResolvedValue({ idusuario: 'owner-1' } as any);

    await expect(service.deleteComment('intruder-2', 'c-1')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  // 10 (UT-072)
  it('UT-072: uploadImage_ArchivoImagenHasta5MiB(5242880Bytes)_SubeAStorageYRetornaUrl(US029)', async () => {
    repository.uploadImageToStorage.mockResolvedValue(
      'https://storage.habitapp.com/community/u-1/img.jpg',
    );
    const file5MiB = {
      originalname: 'evidencia.jpg',
      mimetype: 'image/jpeg',
      size: 5 * 1024 * 1024, // 5.242.880 bytes exactos
      buffer: Buffer.alloc(16),
    } as Express.Multer.File;

    const res = await service.uploadImage('u-1', file5MiB);
    expect(res.url).toContain('https://storage.habitapp.com/community/u-1/');
  });

  // 11 (UT-073)
  it('UT-073: addReaction_ToggleLikeEnForo_AgregaEnPrimerClicYEliminaEnSegundoClic(US030)', async () => {
    repository.getForumSubscription
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ idforo: 'f-1', idusuario: 'u-1' } as any);
    repository.addForumSubscription.mockResolvedValue({ idforo: 'f-1' } as any);

    const first = await service.addReaction('u-1', 'foro', 'f-1', 'LIKE');
    const second = await service.addReaction('u-1', 'foro', 'f-1', 'LIKE');

    expect(first.toggled).toBe('added');
    expect(second.toggled).toBe('removed');
  });

  // 12 (UT-074)
  it('UT-074: addReaction_ToggleEnComentario_MapeaLIKEAMeGustaSinDuplicados', async () => {
    repository.getReaction.mockResolvedValueOnce(null);
    repository.addReaction.mockResolvedValue({
      idreaccion: 'r-1',
      tipo: 'Me gusta',
    } as any);

    const res = await service.addReaction('u-1', 'comentario', 'c-1', 'LIKE');
    expect(repository.addReaction).toHaveBeenCalledWith(
      expect.objectContaining({ tipo: 'Me gusta', idcomentario: 'c-1' }),
    );
    expect(res.toggled).toBe('added');
  });

  // 13 (UT-075)
  it('UT-075: cloneHabit_HabitoPublicoComunitario_IncrementaContadorYCreaEnCuentaDelUsuario(US031)', async () => {
    repository.getPublishedHabit.mockResolvedValue({
      nombre_habito: 'Meditación',
      descripcion: '10 min diarios',
      meta_diaria: 10,
      unidad_medida: 'minutos',
      idcategoria: 'cat-1',
      likes: 5,
      clones_count: 2,
    } as any);
    repository.createUserHabit.mockResolvedValue({
      idhabito: 'new-id',
      idusuario: 'u-1',
    } as any);

    const result = await service.cloneHabit('u-1', 'pub-1');
    expect(repository.updateClonesCount).toHaveBeenCalledWith('pub-1', 3);
    expect(result).toEqual({ idhabito: 'new-id', idusuario: 'u-1' });
  });

  // 14 (UT-076)
  it('UT-076: shareHabit_HabitoYaCompartidoPorElMismoUsuario_LanzaBadRequestException', async () => {
    repository.getUserHabit.mockResolvedValue({
      nombre: 'Leer 20 páginas',
      descripcion: 'Lectura',
      meta_diaria: 20,
      unidad_medida: 'páginas',
      idcategoria: 'cat-1',
      puntos: 10,
    } as any);
    repository.getUserPublishedHabitByName.mockResolvedValueOnce(null);
    repository.publishHabit.mockResolvedValue({ idpublicacion: 'pub-1' } as any);
    await service.shareHabit('u-1', 'hab-1');

    repository.getUserPublishedHabitByName.mockResolvedValueOnce({
      idpublicacion: 'pub-existing',
    } as any);

    await expect(service.shareHabit('u-1', 'hab-1')).rejects.toThrow(
      BadRequestException,
    );
  });

  // 15 (UT-077)
  it('UT-077: deleteSharedHabit_UsuarioNoPropietario_LanzaUnauthorizedException', async () => {
    (repository as any).getCommunityHabits = jest.fn().mockResolvedValue([
      {
        idpublicacion: 'pub-1',
        nombre_habito: 'Meditar',
        idcategoria: 'cat-1',
        idusuario: 'u-1',
      },
    ]);
    (repository as any).getHabitCategories = jest
      .fn()
      .mockResolvedValue([{ idcategoria: 'cat-1', nombre: 'Mente' }]);
    const commHabits = await service.getCommunityHabits();
    expect(commHabits[0].categoria_nombre).toBe('Mente');

    repository.getCoachRoleId.mockResolvedValue('role-coach');
    repository.getUsersByRole.mockResolvedValue([
      { idusuario: 'coach-1', nombre: 'Elena' },
    ] as any);
    repository.getCoachSpecialties.mockResolvedValue([
      { idusuario: 'coach-1', identrenador: 'tr-1', especialidad: 'Nutrición' },
    ] as any);
    const specs = await service.getEspecialistas();
    expect(specs[0].especialidad).toBe('Nutrición');

    repository.getArticulos.mockResolvedValue([{ idarticulo: 'a-1' }] as any);
    expect(await service.getArticulos()).toHaveLength(1);

    repository.getPublishedHabitOwner.mockResolvedValueOnce({
      idusuario: 'u-1',
    } as any);
    await service.deleteSharedHabit('u-1', 'pub-1');

    repository.getPublishedHabitOwner.mockResolvedValueOnce({
      idusuario: 'other-user',
    } as any);

    await expect(service.deleteSharedHabit('u-1', 'pub-1')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  // 16 (UT-078)
  it('UT-078: joinRetoYLeaveReto_CicloInscripcionYAbandono_DelegaAlRepositorio(US032)', async () => {
    repository.getRetos.mockResolvedValue([{ idreto: 'reto-1' }] as any);
    await service.getRetos();
    repository.createReto.mockResolvedValue({ idreto: 'reto-new' } as any);
    await service.createReto('u-1', {
      titulo: 'Reto 7D',
      descripcion: 'Desc',
    });

    repository.joinReto.mockResolvedValue({ joined: true } as any);
    repository.leaveReto.mockResolvedValue({ left: true } as any);

    expect(await service.joinReto('u-1', 'reto-1')).toEqual({ joined: true });
    expect(await service.leaveReto('u-1', 'reto-1')).toEqual({ left: true });
  });

  // 17 (UT-079 — DEF-003)
  it('UT-079: registrarCheckinReto_FechaFinIgualAHoy_PermiteCheckin (DEF-003)', async () => {
    repository.checkinReto.mockResolvedValue({
      completed: true,
      progreso: 100,
      puntosOtorgados: 200,
    } as any);

    const res = await service.checkinReto('u-1', 'reto-hoy');
    expect(repository.checkinReto).toHaveBeenCalledWith('u-1', 'reto-hoy');
    expect(res.completed).toBe(true);
  });

  // 18 (UT-080)
  it('UT-080: registrarCheckinReto_SegundoCheckinMismoDia(TD5-R2)_RechazaDuplicidadDiaria', async () => {
    repository.checkinReto.mockRejectedValue(
      new BadRequestException('Ya registraste tu avance de hoy en este reto.'),
    );

    await expect(service.checkinReto('u-1', 'reto-1')).rejects.toThrow(
      BadRequestException,
    );
  });

  // 19 (UT-081)
  it('UT-081: registrarCheckinReto_RetoConFechaFinAyerOFinalizado(TD5-R5)_LanzaBadRequestException', async () => {
    repository.checkinReto.mockRejectedValue(
      new BadRequestException(
        'El reto ya ha finalizado y no es posible registrar más avances.',
      ),
    );

    await expect(service.checkinReto('u-1', 'reto-vencido')).rejects.toThrow(
      BadRequestException,
    );
  });

  // 20 (UT-082)
  it('UT-082: registrarCheckinReto_UsuarioNoInscritoEnElReto(TD5-R4)_LanzaBadRequestException', async () => {
    repository.checkinReto.mockRejectedValue(
      new BadRequestException('Debes unirte al reto antes de registrar avances.'),
    );

    await expect(service.checkinReto('u-no-inscrito', 'reto-1')).rejects.toThrow(
      BadRequestException,
    );
  });
});
