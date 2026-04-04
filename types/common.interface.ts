export interface ICreateable {
  createdAt: number
}

export interface IUpdateable {
  updatedAt: number;
}

export interface IIdentifiable {
  id: number | string;
}

export interface ITimestamped extends ICreateable, IUpdateable {}

export interface IEntity extends IIdentifiable, ITimestamped {
  error?: { status: number; message: string }
}
