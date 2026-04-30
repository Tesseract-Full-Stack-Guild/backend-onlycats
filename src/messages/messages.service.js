"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesService = void 0;
var common_1 = require("@nestjs/common");
var MessagesService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var MessagesService = _classThis = /** @class */ (function () {
        function MessagesService_1(prisma) {
            this.prisma = prisma;
        }
        MessagesService_1.prototype.sendMessage = function (userId, dto) {
            return __awaiter(this, void 0, void 0, function () {
                var matchId, receiverId, content, actualMatchId, actualReceiverId, match, receiver, existingMatch, message;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            matchId = dto.matchId, receiverId = dto.receiverId, content = dto.content;
                            if (!matchId && !receiverId) {
                                throw new common_1.BadRequestException('Either matchId or receiverId must be provided');
                            }
                            if (matchId && receiverId) {
                                throw new common_1.BadRequestException('Provide only matchId OR receiverId, not both');
                            }
                            actualMatchId = matchId;
                            actualReceiverId = receiverId;
                            if (!matchId) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.prisma.match.findUnique({
                                    where: { id: matchId },
                                    include: { initiator: true, target: true },
                                })];
                        case 1:
                            match = _a.sent();
                            if (!match) {
                                throw new common_1.NotFoundException('Match not found');
                            }
                            if (match.initiatorId !== userId && match.targetId !== userId) {
                                throw new common_1.ForbiddenException('You are not part of this match');
                            }
                            actualReceiverId =
                                match.initiatorId === userId ? match.targetId : match.initiatorId;
                            actualMatchId = matchId;
                            return [3 /*break*/, 5];
                        case 2:
                            if (!receiverId) return [3 /*break*/, 5];
                            return [4 /*yield*/, this.prisma.user.findUnique({
                                    where: { id: receiverId },
                                })];
                        case 3:
                            receiver = _a.sent();
                            if (!receiver) {
                                throw new common_1.NotFoundException('Receiver user not found');
                            }
                            return [4 /*yield*/, this.prisma.match.findFirst({
                                    where: {
                                        OR: [
                                            { initiatorId: userId, targetId: receiverId },
                                            { initiatorId: receiverId, targetId: userId },
                                        ],
                                    },
                                })];
                        case 4:
                            existingMatch = _a.sent();
                            if (existingMatch) {
                                actualMatchId = existingMatch.id;
                            }
                            else {
                                // No existing match, create message without match (matchId undefined)
                                actualMatchId = undefined;
                            }
                            _a.label = 5;
                        case 5:
                            if (!actualReceiverId) {
                                throw new common_1.BadRequestException('Receiver not determined');
                            }
                            return [4 /*yield*/, this.prisma.message.create({
                                    data: {
                                        matchId: actualMatchId,
                                        senderId: userId,
                                        receiverId: actualReceiverId,
                                        content: content,
                                    },
                                    include: {
                                        sender: { select: { id: true, username: true } },
                                        receiver: { select: { id: true, username: true } },
                                        match: true,
                                    },
                                })];
                        case 6:
                            message = _a.sent();
                            return [2 /*return*/, message];
                    }
                });
            });
        };
        MessagesService_1.prototype.getConversations = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var matches;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.match.findMany({
                                where: {
                                    OR: [{ initiatorId: userId }, { targetId: userId }],
                                },
                                orderBy: { createdAt: 'desc' },
                                include: {
                                    initiator: {
                                        select: {
                                            id: true,
                                            username: true,
                                            profile: {
                                                select: {
                                                    name: true,
                                                    photos: {
                                                        where: { isPrimary: true },
                                                        take: 1,
                                                    },
                                                },
                                            },
                                        },
                                    },
                                    target: {
                                        select: {
                                            id: true,
                                            username: true,
                                            profile: {
                                                select: {
                                                    name: true,
                                                    photos: {
                                                        where: { isPrimary: true },
                                                        take: 1,
                                                    },
                                                },
                                            },
                                        },
                                    },
                                    messages: {
                                        orderBy: { createdAt: 'desc' },
                                        take: 1, // last message
                                        select: {
                                            id: true,
                                            content: true,
                                            createdAt: true,
                                            senderId: true,
                                        },
                                    },
                                },
                            })];
                        case 1:
                            matches = _a.sent();
                            return [2 /*return*/, matches
                                    .map(function (match) {
                                    var otherUser = match.initiatorId === userId ? match.target : match.initiator;
                                    var lastMessage = match.messages[0];
                                    if (!lastMessage)
                                        return null;
                                    return {
                                        matchId: match.id,
                                        match: { id: match.id, createdAt: match.createdAt },
                                        otherUser: otherUser,
                                        lastMessage: lastMessage,
                                        unreadCount: 0, // we’ll fix this below
                                    };
                                })
                                    .filter(Boolean)];
                    }
                });
            });
        };
        MessagesService_1.prototype.getMessagesByMatch = function (matchId, userId, cursor) {
            return __awaiter(this, void 0, void 0, function () {
                var match, messages;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.match.findUnique({
                                where: { id: matchId },
                            })];
                        case 1:
                            match = _a.sent();
                            if (!match) {
                                throw new common_1.NotFoundException('Match not found');
                            }
                            if (match.initiatorId !== userId && match.targetId !== userId) {
                                throw new common_1.ForbiddenException('You are not part of this match');
                            }
                            return [4 /*yield*/, this.prisma.message.findMany({
                                    where: { matchId: matchId },
                                    take: 20,
                                    skip: cursor ? 1 : 0,
                                    cursor: cursor ? { id: cursor } : undefined,
                                    orderBy: { createdAt: 'desc' },
                                    include: {
                                        sender: { select: { id: true, username: true } },
                                        receiver: { select: { id: true, username: true } },
                                    },
                                })];
                        case 2:
                            messages = _a.sent();
                            return [2 /*return*/, messages];
                    }
                });
            });
        };
        MessagesService_1.prototype.markAsRead = function (messageId, userId) {
            return __awaiter(this, void 0, void 0, function () {
                var message;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.message.findUnique({
                                where: { id: messageId },
                            })];
                        case 1:
                            message = _a.sent();
                            if (!message) {
                                throw new common_1.NotFoundException('Message not found');
                            }
                            if (message.receiverId !== userId) {
                                throw new common_1.ForbiddenException('You can only mark messages addressed to you as read');
                            }
                            return [4 /*yield*/, this.prisma.message.update({
                                    where: { id: messageId },
                                    data: { readAt: new Date() },
                                })];
                        case 2:
                            _a.sent();
                            return [2 /*return*/, { success: true }];
                    }
                });
            });
        };
        MessagesService_1.prototype.markAllAsReadInMatch = function (matchId, userId) {
            return __awaiter(this, void 0, void 0, function () {
                var match;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.match.findUnique({
                                where: { id: matchId },
                            })];
                        case 1:
                            match = _a.sent();
                            if (!match) {
                                throw new common_1.NotFoundException('Match not found');
                            }
                            if (match.initiatorId !== userId && match.targetId !== userId) {
                                throw new common_1.ForbiddenException('You are not part of this match');
                            }
                            return [4 /*yield*/, this.prisma.message.updateMany({
                                    where: {
                                        matchId: matchId,
                                        receiverId: userId,
                                        readAt: null,
                                    },
                                    data: { readAt: new Date() },
                                })];
                        case 2:
                            _a.sent();
                            return [2 /*return*/, { success: true }];
                    }
                });
            });
        };
        MessagesService_1.prototype.getUnreadCount = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var unreadCounts, total;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.message.groupBy({
                                by: ['matchId'],
                                where: {
                                    receiverId: userId,
                                    readAt: null,
                                },
                                _count: true,
                            })];
                        case 1:
                            unreadCounts = _a.sent();
                            total = unreadCounts.reduce(function (sum, u) { return sum + u._count; }, 0);
                            return [2 /*return*/, total];
                    }
                });
            });
        };
        MessagesService_1.prototype.deleteMessage = function (messageId, userId) {
            return __awaiter(this, void 0, void 0, function () {
                var message;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.message.findUnique({
                                where: { id: messageId },
                            })];
                        case 1:
                            message = _a.sent();
                            if (!message) {
                                throw new common_1.NotFoundException('Message not found');
                            }
                            // Only sender or receiver can delete
                            if (message.senderId !== userId && message.receiverId !== userId) {
                                throw new common_1.ForbiddenException('You cannot delete this message');
                            }
                            return [4 /*yield*/, this.prisma.message.delete({
                                    where: { id: messageId },
                                })];
                        case 2:
                            _a.sent();
                            return [2 /*return*/, { success: true, message: 'Message deleted' }];
                    }
                });
            });
        };
        return MessagesService_1;
    }());
    __setFunctionName(_classThis, "MessagesService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        MessagesService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return MessagesService = _classThis;
}();
exports.MessagesService = MessagesService;
