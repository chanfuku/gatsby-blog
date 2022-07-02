import React from "react"
import { graphql } from "gatsby"
import PropTypes from "prop-types"
import Bio from "../components/bio"
import Layout from "../components/layout"
import Seo from "../components/seo"
import Posts from "../components/posts"
import TagsComponent from "../components/tags"

const Tags = ({ pageContext, data, location }) => {
  const { tag } = pageContext
  const { nodes: posts, totalCount } = data.allMarkdownRemark
  const tagHeader = `${totalCount} post${
    totalCount === 1 ? "" : "s"
  } tagged with "${tag}"`

  const siteTitle = data.site.siteMetadata?.title || `Title`
  // const currentPage = location.pathname.replace('/page/', '')

  return (
    <Layout location={location} title={siteTitle}>
      <Seo title={siteTitle} />
      <Bio />
      <h1>{tagHeader}</h1>
      <section className="main-content">
        <TagsComponent data={data} />
        <Posts posts={posts} />
      </section>
    </Layout>
  )
}

export default Tags

export const pageQuery = graphql`
  query($tag: String) {
    site {
      siteMetadata {
        title
        description
      }
    }
    allMarkdownRemark(
      limit: 2000
      sort: { fields: [frontmatter___date], order: DESC }
      filter: { frontmatter: { tags: { in: [$tag] } } }
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
    tagsGroup: allMarkdownRemark(limit: 2000) {
      group(field: frontmatter___tags) {
        fieldValue
        totalCount
      }
    }
  }
`
