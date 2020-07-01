import { complement, isEmpty, isNil, either, prop, uniqBy, sortBy, compose, pathEq, sort, descend } from "ramda";

interface FirebaseDate {
  seconds: number;
  nanoseconds: number;
}

const ToDate = (date: FirebaseDate) => {
  const toMillis = () => 1e3 * date.seconds + date.nanoseconds / 1e6;
  return new Date(toMillis());
};

const notEmpty = complement(isEmpty);
const notNil = complement(isNil);
const isReallyEmpty = either(isNil, isEmpty);
const isReallyNotEmpty = complement(either(isNil, isEmpty));
const removeDupsById = uniqBy(prop('id'));
const desc = (a: any) => -a;
const sortByDateDesc = sortBy(compose(desc, ToDate, prop('createdAt')));
const isPathname = (pathname: string, history: any) => pathEq(['location', 'pathname'], pathname)(history);

export {
  notEmpty,
  notNil,
  isReallyEmpty,
  isReallyNotEmpty,
  removeDupsById,
  sortByDateDesc,
  isPathname
}

