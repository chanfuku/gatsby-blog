import * as React from "react"
import { graphql } from "gatsby"
import Bio from "../components/bio"
import Layout from "../components/layout"
import Seo from "../components/seo"
import Pagination from "../components/pagination"
import Posts from "../components/posts"

const BlogPage = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata?.title || `Title`
  const posts = data.allMarkdownRemark.nodes
  const currentPage = location.pathname.replace('/page/', '')

  return (
    <Layout location={location} title={siteTitle}>
      <Seo title={siteTitle} />
      <Bio />
      <Posts posts={posts} />
      <Pagination totalCount={data.allMarkdownRemark.totalCount} currentPage={currentPage} />
    </Layout>
  )
}

export default BlogPage

export const query = graphql`
  query ($limit: Int!, $skip: Int!) {
    site {
      siteMetadata {
        title
        description
      }
    }
    allMarkdownRemark(
      sort: { fields: [frontmatter___date], order: DESC }
      skip: $skip
      limit: $limit
      ) {
      totalCount
      nodes {
        excerpt
        fields {
          slug
        }
        frontmatter {
          date(formatString: "MMMM DD, YYYY")
          title
          description
        }
      }
    }
  }
`
