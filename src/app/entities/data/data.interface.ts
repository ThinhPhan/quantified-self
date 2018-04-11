import {PointInterface} from '../points/point.interface';
import {SerializableClassInterface} from '../serializable/serializable.class.interface';

export interface DataInterface extends SerializableClassInterface {
  setValue(value: string|number);
  getValue(): number;
  getType(): string;
  getUnit(): string;
}
