import api from "@/lib/axios";

export const login = (data: { email: string; password: string }) =>
  api.post("/users/login", data);

export const signup = (data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}) => api.post("/users/signup", data);

export const getUserByEmail = (email: string) =>
  api.get("/users/email", { params: { email } });

export const editProfile = (email: string, data: {
  firstName: string;
  lastName: string;
  phoneNumber: string;
}) => api.post("/users/edit", data, { params: { id: email } });