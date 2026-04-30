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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateProfileDto = exports.Year = exports.Seeking = exports.Gender = void 0;
var class_validator_1 = require("class-validator");
var class_transformer_1 = require("class-transformer");
var Gender;
(function (Gender) {
    Gender["MALE"] = "MALE";
    Gender["FEMALE"] = "FEMALE";
    Gender["NON_BINARY"] = "NON_BINARY";
})(Gender || (exports.Gender = Gender = {}));
var Seeking;
(function (Seeking) {
    Seeking["MALE"] = "MALE";
    Seeking["FEMALE"] = "FEMALE";
    Seeking["EVERYONE"] = "EVERYONE";
})(Seeking || (exports.Seeking = Seeking = {}));
var Year;
(function (Year) {
    Year[Year["FRESHMAN"] = 1] = "FRESHMAN";
    Year[Year["SOPHOMORE"] = 2] = "SOPHOMORE";
    Year[Year["JUNIOR"] = 3] = "JUNIOR";
    Year[Year["SENIOR"] = 4] = "SENIOR";
})(Year || (exports.Year = Year = {}));
var CreateProfileDto = function () {
    var _a;
    var _name_decorators;
    var _name_initializers = [];
    var _name_extraInitializers = [];
    var _age_decorators;
    var _age_initializers = [];
    var _age_extraInitializers = [];
    var _phone_decorators;
    var _phone_initializers = [];
    var _phone_extraInitializers = [];
    var _gender_decorators;
    var _gender_initializers = [];
    var _gender_extraInitializers = [];
    var _seeking_decorators;
    var _seeking_initializers = [];
    var _seeking_extraInitializers = [];
    var _bio_decorators;
    var _bio_initializers = [];
    var _bio_extraInitializers = [];
    var _location_decorators;
    var _location_initializers = [];
    var _location_extraInitializers = [];
    var _college_decorators;
    var _college_initializers = [];
    var _college_extraInitializers = [];
    var _course_decorators;
    var _course_initializers = [];
    var _course_extraInitializers = [];
    var _major_decorators;
    var _major_initializers = [];
    var _major_extraInitializers = [];
    var _year_decorators;
    var _year_initializers = [];
    var _year_extraInitializers = [];
    var _dorm_decorators;
    var _dorm_initializers = [];
    var _dorm_extraInitializers = [];
    var _sameMajorOnly_decorators;
    var _sameMajorOnly_initializers = [];
    var _sameMajorOnly_extraInitializers = [];
    var _interests_decorators;
    var _interests_initializers = [];
    var _interests_extraInitializers = [];
    return _a = /** @class */ (function () {
            function CreateProfileDto() {
                this.name = __runInitializers(this, _name_initializers, '');
                this.age = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _age_initializers, 0));
                this.phone = (__runInitializers(this, _age_extraInitializers), __runInitializers(this, _phone_initializers, void 0));
                this.gender = (__runInitializers(this, _phone_extraInitializers), __runInitializers(this, _gender_initializers, Gender.MALE));
                this.seeking = (__runInitializers(this, _gender_extraInitializers), __runInitializers(this, _seeking_initializers, Seeking.EVERYONE));
                this.bio = (__runInitializers(this, _seeking_extraInitializers), __runInitializers(this, _bio_initializers, void 0));
                this.location = (__runInitializers(this, _bio_extraInitializers), __runInitializers(this, _location_initializers, void 0));
                this.college = (__runInitializers(this, _location_extraInitializers), __runInitializers(this, _college_initializers, void 0));
                this.course = (__runInitializers(this, _college_extraInitializers), __runInitializers(this, _course_initializers, void 0));
                this.major = (__runInitializers(this, _course_extraInitializers), __runInitializers(this, _major_initializers, void 0));
                this.year = (__runInitializers(this, _major_extraInitializers), __runInitializers(this, _year_initializers, void 0));
                this.dorm = (__runInitializers(this, _year_extraInitializers), __runInitializers(this, _dorm_initializers, void 0));
                this.sameMajorOnly = (__runInitializers(this, _dorm_extraInitializers), __runInitializers(this, _sameMajorOnly_initializers, void 0));
                this.interests = (__runInitializers(this, _sameMajorOnly_extraInitializers), __runInitializers(this, _interests_initializers, []));
                __runInitializers(this, _interests_extraInitializers);
            }
            return CreateProfileDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.IsString)(), (0, class_validator_1.Length)(2, 50)];
            _age_decorators = [(0, class_validator_1.IsNotEmpty)(), (0, class_transformer_1.Type)(function () { return Number; }), (0, class_validator_1.IsInt)(), (0, class_validator_1.Min)(18), (0, class_validator_1.Max)(100)];
            _phone_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _gender_decorators = [(0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.IsEnum)(Gender)];
            _seeking_decorators = [(0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.IsEnum)(Seeking)];
            _bio_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)(), (0, class_validator_1.Length)(0, 500)];
            _location_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)(), (0, class_validator_1.Length)(0, 100)];
            _college_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)(), (0, class_validator_1.Length)(2, 100)];
            _course_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)(), (0, class_validator_1.Length)(2, 100)];
            _major_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)(), (0, class_validator_1.Length)(2, 100)];
            _year_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(Year)];
            _dorm_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)(), (0, class_validator_1.Length)(2, 50)];
            _sameMajorOnly_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)()];
            _interests_decorators = [(0, class_validator_1.IsArray)(), (0, class_validator_1.ArrayNotEmpty)(), (0, class_validator_1.IsString)({ each: true })];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: function (obj) { return "name" in obj; }, get: function (obj) { return obj.name; }, set: function (obj, value) { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _age_decorators, { kind: "field", name: "age", static: false, private: false, access: { has: function (obj) { return "age" in obj; }, get: function (obj) { return obj.age; }, set: function (obj, value) { obj.age = value; } }, metadata: _metadata }, _age_initializers, _age_extraInitializers);
            __esDecorate(null, null, _phone_decorators, { kind: "field", name: "phone", static: false, private: false, access: { has: function (obj) { return "phone" in obj; }, get: function (obj) { return obj.phone; }, set: function (obj, value) { obj.phone = value; } }, metadata: _metadata }, _phone_initializers, _phone_extraInitializers);
            __esDecorate(null, null, _gender_decorators, { kind: "field", name: "gender", static: false, private: false, access: { has: function (obj) { return "gender" in obj; }, get: function (obj) { return obj.gender; }, set: function (obj, value) { obj.gender = value; } }, metadata: _metadata }, _gender_initializers, _gender_extraInitializers);
            __esDecorate(null, null, _seeking_decorators, { kind: "field", name: "seeking", static: false, private: false, access: { has: function (obj) { return "seeking" in obj; }, get: function (obj) { return obj.seeking; }, set: function (obj, value) { obj.seeking = value; } }, metadata: _metadata }, _seeking_initializers, _seeking_extraInitializers);
            __esDecorate(null, null, _bio_decorators, { kind: "field", name: "bio", static: false, private: false, access: { has: function (obj) { return "bio" in obj; }, get: function (obj) { return obj.bio; }, set: function (obj, value) { obj.bio = value; } }, metadata: _metadata }, _bio_initializers, _bio_extraInitializers);
            __esDecorate(null, null, _location_decorators, { kind: "field", name: "location", static: false, private: false, access: { has: function (obj) { return "location" in obj; }, get: function (obj) { return obj.location; }, set: function (obj, value) { obj.location = value; } }, metadata: _metadata }, _location_initializers, _location_extraInitializers);
            __esDecorate(null, null, _college_decorators, { kind: "field", name: "college", static: false, private: false, access: { has: function (obj) { return "college" in obj; }, get: function (obj) { return obj.college; }, set: function (obj, value) { obj.college = value; } }, metadata: _metadata }, _college_initializers, _college_extraInitializers);
            __esDecorate(null, null, _course_decorators, { kind: "field", name: "course", static: false, private: false, access: { has: function (obj) { return "course" in obj; }, get: function (obj) { return obj.course; }, set: function (obj, value) { obj.course = value; } }, metadata: _metadata }, _course_initializers, _course_extraInitializers);
            __esDecorate(null, null, _major_decorators, { kind: "field", name: "major", static: false, private: false, access: { has: function (obj) { return "major" in obj; }, get: function (obj) { return obj.major; }, set: function (obj, value) { obj.major = value; } }, metadata: _metadata }, _major_initializers, _major_extraInitializers);
            __esDecorate(null, null, _year_decorators, { kind: "field", name: "year", static: false, private: false, access: { has: function (obj) { return "year" in obj; }, get: function (obj) { return obj.year; }, set: function (obj, value) { obj.year = value; } }, metadata: _metadata }, _year_initializers, _year_extraInitializers);
            __esDecorate(null, null, _dorm_decorators, { kind: "field", name: "dorm", static: false, private: false, access: { has: function (obj) { return "dorm" in obj; }, get: function (obj) { return obj.dorm; }, set: function (obj, value) { obj.dorm = value; } }, metadata: _metadata }, _dorm_initializers, _dorm_extraInitializers);
            __esDecorate(null, null, _sameMajorOnly_decorators, { kind: "field", name: "sameMajorOnly", static: false, private: false, access: { has: function (obj) { return "sameMajorOnly" in obj; }, get: function (obj) { return obj.sameMajorOnly; }, set: function (obj, value) { obj.sameMajorOnly = value; } }, metadata: _metadata }, _sameMajorOnly_initializers, _sameMajorOnly_extraInitializers);
            __esDecorate(null, null, _interests_decorators, { kind: "field", name: "interests", static: false, private: false, access: { has: function (obj) { return "interests" in obj; }, get: function (obj) { return obj.interests; }, set: function (obj, value) { obj.interests = value; } }, metadata: _metadata }, _interests_initializers, _interests_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.CreateProfileDto = CreateProfileDto;
