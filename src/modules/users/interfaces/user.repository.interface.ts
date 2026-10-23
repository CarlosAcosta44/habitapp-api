
export interface IUserRepository {
  findByEmail(email: string): Promise<any>;
  findById(id: string): Promise<any>;
  create(userData: any): Promise<any>;
  update(id: string, data: any): Promise<any>;
  getDefaultRoleId(): Promise<string>;
}
