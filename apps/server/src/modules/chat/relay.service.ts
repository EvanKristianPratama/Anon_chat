import { Injectable } from "@nestjs/common";
import { RoomService } from "./room.service";

interface TextRelay {
    partnerSocketId: string;
    payload: { from: string; alias?: string; text: string; at: number };
}

interface ImageRelay {
    partnerSocketId: string;
    payload: {
        from: string;
        alias?: string;
        mime: "image/jpeg" | "image/png" | "image/webp";
        bytes: Uint8Array;
        at: number;
    };
}

@Injectable()
export class RelayService {
    constructor(private readonly rooms: RoomService) { }

    async text(fromUserId: string, text: string, alias?: string): Promise<TextRelay | null> {
        const room = await this.rooms.findByUser(fromUserId);
        if (!room) return null;

        const partnerSocketId = this.rooms.resolvePartnerSocket(room, fromUserId);
        await this.rooms.touch(fromUserId);

        return {
            partnerSocketId,
            payload: { from: fromUserId, alias, text, at: Date.now() },
        };
    }

    async image(
        fromUserId: string,
        mime: "image/jpeg" | "image/png" | "image/webp",
        bytes: Uint8Array,
        alias?: string,
    ): Promise<ImageRelay | null> {
        const room = await this.rooms.findByUser(fromUserId);
        if (!room) return null;

        const partnerSocketId = this.rooms.resolvePartnerSocket(room, fromUserId);
        await this.rooms.touch(fromUserId);

        return {
            partnerSocketId,
            payload: { from: fromUserId, alias, mime, bytes, at: Date.now() },
        };
    }
}
