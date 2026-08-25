export enum GenderEnum {
    MALE,
    FEMALE
}
export enum ProviderEnum {
    SYSTEM,
    GOOGLE
}
export enum RulesEnum {
    USER,
    ADMIN
}

export interface IUser {
    name: string;
    email: string;
    password: string;
    age: number;
    isOnline: boolean;
    isActive: boolean;
    gender: GenderEnum;
    phone: string;
    confirmedAt: Date;
    changedCredentialsAt: Date;
    provider: ProviderEnum;
    role: RulesEnum;
    profilePic: string;
    coverPics: [string];
    bio: string;
}