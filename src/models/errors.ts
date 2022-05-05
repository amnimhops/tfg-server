export enum ServiceErrorCode{
    BadRequest = 400,   // En general, se tomará este error cuando el problema sea una entrada inválida
    Unauthorized = 401, // Se ha intentado llevar a cabo una acción sin la debida a autorización
    Forbidden = 403,    // Se ha intentado acceder a una operación a la que no se tienen permisos
    NotFound = 404,     // Se ha intentado acceder a un recurso que no existe
    Conflict = 409,     // La operación produce un conflicto en el estado de la aplicación (id's duplicados, violación de reglas, etc.)
    ServerError = 500,  // En general, se tomará este error cuando sea un problema de estado del servidor
};

export type ServiceError = {
    code:ServiceErrorCode;
    message:string;
}