import { HydratedDocument, Model, Schema } from "mongoose";
import { t } from "../utils.js";

export interface RankChannel {
  channelId: string;
  messageId?: string; // Agora opcional
  type: "ryos" | "cards" | "quiz";
  lastUpdate?: Date;
}

export interface ServerConfigSchema {
  guildId: string;
  rankChannels: RankChannel[];
  settings: {
    updateInterval: number; // intervalo em minutos
    deleteCommands: boolean;
    allowDuplicateChannels: boolean;
  };
}

export interface serverConfigMethods {
  updateRankMessageId(type: RankChannel["type"], messageId: string): Promise<HydratedServerConfigDocument>;
  setRankChannel(channelId: string, type: RankChannel["type"]): Promise<HydratedServerConfigDocument>;
  getRankChannel(type: RankChannel["type"]): RankChannel | undefined;
}

export interface serverConfigStatics {
  get(guildId: string): Promise<HydratedServerConfigDocument>;
}

export type HydratedServerConfigDocument = HydratedDocument<ServerConfigSchema, serverConfigMethods>;
export type ServerConfigModel = Model<ServerConfigSchema, {}, serverConfigMethods> & serverConfigStatics;

export const serverConfigSchema = new Schema<
  ServerConfigSchema,
  ServerConfigModel,
  serverConfigMethods
>({
  guildId: { ...t.string, required: true, unique: true },
  rankChannels: [{
    channelId: { ...t.string, required: true },
    messageId: { ...t.string, required: false }, // Agora opcional
    type: { 
      type: String, 
      required: true,
      enum: ["ryos", "cards", "quiz"]
    },
    lastUpdate: t.date
  }],
  settings: {
    updateInterval: { type: Number, default: 5 }, // 5 minutos padrão
    deleteCommands: { type: Boolean, default: true },
    allowDuplicateChannels: { type: Boolean, default: false }
  }
}, {
  timestamps: true,
  statics: {
    async get(guildId: string) {
      let config = await this.findOne({ guildId });
      
      if (!config) {
        config = await this.create({
          guildId,
          rankChannels: [],
          settings: {
            updateInterval: 5,
            deleteCommands: true,
            allowDuplicateChannels: false
          }
        });
      }

      return config;
    }
  },
  methods: {
    async updateRankMessageId(type, messageId) {
      const channel = this.rankChannels.find(ch => ch.type === type);
      if (channel) {
        channel.messageId = messageId;
        channel.lastUpdate = new Date();
      }
      return await this.save();
    },
    async setRankChannel(channelId, type) {
      // Remove existing channel of same type if exists
      this.rankChannels = this.rankChannels.filter(ch => ch.type !== type);

      // Add new channel
      this.rankChannels.push({
        channelId,
        type,
        lastUpdate: new Date()
      });

      return await this.save();
    },
    getRankChannel(type) {
      return this.rankChannels.find(ch => ch.type === type);
    }
  }
});