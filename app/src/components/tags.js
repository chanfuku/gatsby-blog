import * as React from 'react'
import { Link } from "gatsby"
import { Helmet } from "react-helmet"
import kebabCase from "lodash/kebabCase"
import IsMobileSize from "../lib/mediaQuery"

const Tags = ({
  data: {
    allMarkdownRemark: { totalCount },
    site: {
      siteMetadata: { title },
    },
    tagsGroup: { group }
  },
}) => {

  const showTaglist = !IsMobileSize()

  return (
    <>
      {showTaglist &&
        <div className="taglist">
          <Helmet title={title} />
          <div>
            <h3>tags</h3>
            <ul>
              {group.map(tag => (
                <li key={tag.fieldValue}>
                  <Link to={`/tags/${kebabCase(tag.fieldValue)}/`}>
                    {tag.fieldValue} ({tag.totalCount})
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      }
    </>
  )
}

export default Tags
