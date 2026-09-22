import { FriendsService } from '../services/friends.service';
import { AddFriendDto } from '../dto/create-record.dto';
export declare class FriendsController {
    private readonly friendsService;
    constructor(friendsService: FriendsService);
    getFriends(req: any): Promise<{
        id: any;
        nombre: any;
        apellido: any;
        puntos: any;
        top: boolean;
    }[]>;
    getSuggestions(req: any, limit?: string): Promise<{
        id: any;
        nombre: any;
        apellido: any;
    }[]>;
    addFriend(dto: AddFriendDto, req: any): Promise<{
        success: boolean;
    }>;
    acceptRequest(friendId: string, req: any): {
        message: string;
    };
    rejectRequest(friendId: string, req: any): {
        message: string;
    };
    removeFriend(friendId: string, req: any): {
        message: string;
    };
}
