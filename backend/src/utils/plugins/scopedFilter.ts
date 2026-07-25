import { Schema } from 'mongoose';

export function scopedFilter(schema: Schema) {
  schema.pre('find', function (this: any) {
    if (this.getFilter().userId) {
      this.where({ userId: this.getFilter().userId });
    }
  });

  schema.pre('findOne', function (this: any) {
    if (this.getFilter().userId) {
      this.where({ userId: this.getFilter().userId });
    }
  });
}
