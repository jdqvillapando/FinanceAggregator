import axios, { type AxiosResponse } from 'axios';
import type { Result } from '../models/apiResponse';
import type { User, UserFormValues } from '../models/user';


// Use an instance instead of global defaults
const api = axios.create({
    baseURL: 'http://localhost:5153/api/v1'
});

const responseBody = <T>(response: AxiosResponse<T>) => response.data;

const authService = {
    register: (values: UserFormValues) => api.post<Result<string>>('/auth/register', values).then(responseBody),
    login: (values: UserFormValues) => api.post<Result<User>>('/auth/login', values).then(responseBody),
};

const agent = { authService };


export default agent;