export interface NavItem {
  key: 'query' | 'publish' | 'my-posts' | 'my-claims' | 'agent'
  label: string
  path: '/query' | '/publish' | '/my-posts' | '/my-claims' | '/agent'
}
