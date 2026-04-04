export interface ICreateable {
  createdAt: number
}

export interface IUpdateable {
  updatedAt: number;
}

export interface ITimestamped extends ICreateable, IUpdateable {}

export interface IEntity extends ITimestamped {
  id: number | string;
}
