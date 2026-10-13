export class ApiResponse<T = unknown> {
  public success: boolean;
  public message: string;
  public data?: T;

  constructor(data?: T, message: string = 'Success', success: boolean = true) {
    this.success = success;
    this.message = message;
    this.data = data;
  }
}

export default ApiResponse;
