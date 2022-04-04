export enum ServiceErrorCode{
    Unauthorized = 401,
    NotFound = 404,
    Duplicated = 409,
    ServerError = 500,
};
export type ServiceError = {
    code:ServiceErrorCode;
    message:string;
}