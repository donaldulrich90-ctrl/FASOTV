import api from "./api";

export const authService = {
  async login(phone, password) {
    const { data } = await api.post("/accounts/login/", { phone, password });
    localStorage.setItem("access_token", data.access);
    localStorage.setItem("refresh_token", data.refresh);
    return data.user;
  },

  async register(phone, name, password, password2, code_parrainage = "") {
    const { data } = await api.post("/accounts/register/", {
      phone, name, password, password2,
      ...(code_parrainage ? { code_parrainage } : {}),
    });
    return data;
  },

  async getProfile() {
    const { data } = await api.get("/accounts/profile/");
    return data;
  },

  async updateProfile(formData) {
    const { data } = await api.patch("/accounts/profile/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  async changePassword(old_password, new_password) {
    const { data } = await api.post("/accounts/change-password/", { old_password, new_password });
    return data;
  },

  logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },

  isAuthenticated() {
    return !!localStorage.getItem("access_token");
  },
};
