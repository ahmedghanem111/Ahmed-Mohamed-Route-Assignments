import { BadRequestException } from "../../utils/error.exceptions.js";
import { loginDTOBody, loginDTOQuery } from "./auth.validation.js";




export const loginService = (body: loginDTOBody, query: loginDTOQuery) => {
    throw new BadRequestException("Invalid email or password");
    return {
        data: { body, query }
    }
} 