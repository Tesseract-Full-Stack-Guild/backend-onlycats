"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
exports.MessagesController = void 0;
var common_1 = require("@nestjs/common");
var passport_1 = require("@nestjs/passport");
var MessagesController = function () {
    var _classDecorators = [(0, common_1.Controller)('messages')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _getConversations_decorators;
    var _getMessagesByMatch_decorators;
    var _sendMessage_decorators;
    var _markAsRead_decorators;
    var _markAllAsReadInMatch_decorators;
    var _getUnreadCount_decorators;
    var _deleteMessage_decorators;
    var MessagesController = _classThis = /** @class */ (function () {
        function MessagesController_1(messagesService) {
            this.messagesService = (__runInitializers(this, _instanceExtraInitializers), messagesService);
        }
        MessagesController_1.prototype.getConversations = function (req) {
            return __awaiter(this, void 0, void 0, function () {
                var user;
                return __generator(this, function (_a) {
                    user = req.user;
                    return [2 /*return*/, this.messagesService.getConversations(user.userId)];
                });
            });
        };
        MessagesController_1.prototype.getMessagesByMatch = function (matchId, req) {
            return __awaiter(this, void 0, void 0, function () {
                var user;
                return __generator(this, function (_a) {
                    user = req.user;
                    return [2 /*return*/, this.messagesService.getMessagesByMatch(matchId, user.userId)];
                });
            });
        };
        MessagesController_1.prototype.sendMessage = function (createMessageDto, req) {
            return __awaiter(this, void 0, void 0, function () {
                var user;
                return __generator(this, function (_a) {
                    user = req.user;
                    return [2 /*return*/, this.messagesService.sendMessage(user.userId, createMessageDto)];
                });
            });
        };
        MessagesController_1.prototype.markAsRead = function (messageId, req) {
            return __awaiter(this, void 0, void 0, function () {
                var user;
                return __generator(this, function (_a) {
                    user = req.user;
                    return [2 /*return*/, this.messagesService.markAsRead(messageId, user.userId)];
                });
            });
        };
        MessagesController_1.prototype.markAllAsReadInMatch = function (matchId, req) {
            return __awaiter(this, void 0, void 0, function () {
                var user;
                return __generator(this, function (_a) {
                    user = req.user;
                    return [2 /*return*/, this.messagesService.markAllAsReadInMatch(matchId, user.userId)];
                });
            });
        };
        MessagesController_1.prototype.getUnreadCount = function (req) {
            return __awaiter(this, void 0, void 0, function () {
                var user, count;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            user = req.user;
                            return [4 /*yield*/, this.messagesService.getUnreadCount(user.userId)];
                        case 1:
                            count = _a.sent();
                            return [2 /*return*/, { count: count }];
                    }
                });
            });
        };
        MessagesController_1.prototype.deleteMessage = function (messageId, req) {
            return __awaiter(this, void 0, void 0, function () {
                var user;
                return __generator(this, function (_a) {
                    user = req.user;
                    return [2 /*return*/, this.messagesService.deleteMessage(messageId, user.userId)];
                });
            });
        };
        return MessagesController_1;
    }());
    __setFunctionName(_classThis, "MessagesController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _getConversations_decorators = [(0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')), (0, common_1.Get)()];
        _getMessagesByMatch_decorators = [(0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')), (0, common_1.Get)('match/:matchId')];
        _sendMessage_decorators = [(0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')), (0, common_1.Post)()];
        _markAsRead_decorators = [(0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')), (0, common_1.Patch)(':messageId/read')];
        _markAllAsReadInMatch_decorators = [(0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')), (0, common_1.Patch)('match/:matchId/read')];
        _getUnreadCount_decorators = [(0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')), (0, common_1.Get)('unread/count')];
        _deleteMessage_decorators = [(0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')), (0, common_1.HttpCode)(200), (0, common_1.Delete)(':messageId')];
        __esDecorate(_classThis, null, _getConversations_decorators, { kind: "method", name: "getConversations", static: false, private: false, access: { has: function (obj) { return "getConversations" in obj; }, get: function (obj) { return obj.getConversations; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getMessagesByMatch_decorators, { kind: "method", name: "getMessagesByMatch", static: false, private: false, access: { has: function (obj) { return "getMessagesByMatch" in obj; }, get: function (obj) { return obj.getMessagesByMatch; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _sendMessage_decorators, { kind: "method", name: "sendMessage", static: false, private: false, access: { has: function (obj) { return "sendMessage" in obj; }, get: function (obj) { return obj.sendMessage; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _markAsRead_decorators, { kind: "method", name: "markAsRead", static: false, private: false, access: { has: function (obj) { return "markAsRead" in obj; }, get: function (obj) { return obj.markAsRead; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _markAllAsReadInMatch_decorators, { kind: "method", name: "markAllAsReadInMatch", static: false, private: false, access: { has: function (obj) { return "markAllAsReadInMatch" in obj; }, get: function (obj) { return obj.markAllAsReadInMatch; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getUnreadCount_decorators, { kind: "method", name: "getUnreadCount", static: false, private: false, access: { has: function (obj) { return "getUnreadCount" in obj; }, get: function (obj) { return obj.getUnreadCount; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _deleteMessage_decorators, { kind: "method", name: "deleteMessage", static: false, private: false, access: { has: function (obj) { return "deleteMessage" in obj; }, get: function (obj) { return obj.deleteMessage; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        MessagesController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return MessagesController = _classThis;
}();
exports.MessagesController = MessagesController;
