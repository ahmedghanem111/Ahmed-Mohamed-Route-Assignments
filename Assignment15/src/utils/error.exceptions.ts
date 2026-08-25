import z from "zod";
export interface IError extends Error {
   statusCode: number;
   validationError?:z.core.$ZodIssue[]
}
abstract class AppError extends Error{
   constructor(message: string, options:ErrorOptions, public statusCode: number, public validationError?: z.core.$ZodIssue[]) {
      super(message, options);
   }
}   
 
 
export class NotFoundException extends AppError {
   constructor(message = "not found", options: ErrorOptions = {}) {
      super(message, options, 404);
   }
}


export class BadRequestException extends AppError {
   constructor(message: string, options: ErrorOptions = {}) {
      super(message, options, 400);
   }
}  


export class validationException extends AppError {
   constructor(validationError: z.core.$ZodIssue[]) {
      super("Validation Error", {}, 409, validationError);
   }
}  