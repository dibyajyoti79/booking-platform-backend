class ApiResponse {
  public success: boolean;
  public message: string;
  public data: unknown;
  public error: unknown;

  constructor(message: string = "Success", data: unknown = undefined) {
    this.success = true;
    this.message = message;
    this.data = data;
  }
}

export { ApiResponse };
