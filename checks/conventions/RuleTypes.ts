import type { RuleTester } from 'oxlint/plugins-dev';

export type Rule = Parameters<RuleTester['run']>[1];

type Visitor = ReturnType<NonNullable<Rule['create']>>;

export type ProgramNode = Parameters<NonNullable<Visitor['Program']>>[0];

export type ExportEntry = {
  name: string;
  node: ProgramNode['body'][number];
};
