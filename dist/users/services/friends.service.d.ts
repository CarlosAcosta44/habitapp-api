import { FriendsRepository } from '../repositories/friends.repository';
export declare class FriendsService {
    private readonly friendsRepo;
    constructor(friendsRepo: FriendsRepository);
    addFriend(userId: string, targetUserId: string): Promise<{
        success: boolean;
    }>;
    getFriends(userId: string): Promise<{
        id: any;
        nombre: any;
        apellido: any;
        puntos: any;
        top: boolean;
    }[]>;
    getSuggestions(userId: string, limit?: number): Promise<{
        id: any;
        nombre: any;
        apellido: any;
    }[]>;
}
