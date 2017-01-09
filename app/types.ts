export interface wsparams {
  filter_eduPersonAffiliation?: string;
  filter_supannEntiteAffectation?: string;
  filter_member_of_group?: string; 
  
  filter_category?: string;
  group_attrs?: string; 
  CAS: boolean;

  token?: string;
  maxRows?: number;
}

export interface filters {
    affiliation?: string;
    affectation?: string;
    diploma?: string;
    token?: string;
}