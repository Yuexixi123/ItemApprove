// @ts-ignore
/* eslint-disable */

declare namespace API {
  type AssociationType = {
    id: number;
    asst_id: number;
    asst_key: string;
    asst_name: string;
    src_desc: string;
    dest_desc: string;
    count: number;
    desc: string;
    direction: 'src_to_dest' | 'none' | 'bidirectional';
  };

  type AssociationTypeListResponse = {
    code: number;
    inside_code: number;
    msg: string;
    data: {
      pagination: Pagination;
      data: AssociationType[];
    };
  };

  type CreateAssociationTypeRequest = {
    asst_key: string;
    asst_name: string;
    src_desc: string;
    dest_desc: string;
    desc?: string;
    direction: 'src_to_dest' | 'none' | 'bidirectional';
  };

  type CreateAssociationTypeResponse = {
    code: number;
    inside_code: number;
    msg: string;
    data: any; // 根据实际返回数据结构调整
  };

  type DeleteAssociationTypeRequest = {
    asst_id: number;
  };

  type DeleteAssociationTypeResponse = {
    code: number;
    inside_code: number;
    msg: string;
    data: any; // 根据实际返回数据结构调整
  };

  type UpdateAssociationTypeRequest = {
    asst_id: number;
    asst_name?: string;
    dest_desc?: string;
    src_desc?: string;
    direction?: 'src_to_dest' | 'none' | 'bidirectional';
  };

  type UpdateAssociationTypeResponse = {
    code: number;
    inside_code: number;
    msg: string;
    data: AssociationType; // 根据实际返回数据结构调整
  };
}
