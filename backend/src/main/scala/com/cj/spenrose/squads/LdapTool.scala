package com.cj.spenrose.squads
import java.util.Hashtable
import javax.naming.Context
import javax.naming.ldap.Control
import javax.naming.ldap.InitialLdapContext
import javax.naming.AuthenticationException
import javax.naming.NamingException
import javax.naming.directory.SearchControls
import javax.naming.NamingEnumeration
import javax.naming.directory.SearchResult
import java.io.FileOutputStream
import java.io.BufferedReader
import java.io.InputStreamReader

class LdapTool(url: String, ldapUser: String, ldapPassword: String)  {
  private val connCtls = Array[Control]()

  def authenticate(name: String, password: String, ctx: InitialLdapContext = connect()) = {
    try {
      ctx.addToEnvironment(Context.SECURITY_PRINCIPAL, name)
      ctx.addToEnvironment(Context.SECURITY_CREDENTIALS, password)
      ctx.reconnect(connCtls)
      true
    } catch {
      case e: AuthenticationException => false
      case e: NamingException => false
    }
  }
  
  def authenticateEmail(email: String, password: String) = {
    val ctx = connect()
    authenticate(ldapUser, ldapPassword, ctx)
    findByEmail(email, ctx) match {
      case Some(user) =>
        val passwordIsGood = authenticate(user.getName, password)
        if (passwordIsGood) {
          // user
          true
        } else {
          false
        }
      case None => false
    }
  }

  private def findByEmail(email: String, ctx: InitialLdapContext):Option[SearchResult] = {
    val controls = new SearchControls() {
      setReturningObjFlag(true)
      setSearchScope(SearchControls.SUBTREE_SCOPE)
    }

    val filter = "(&(objectclass=user)(mail=" + email + "))"
    val answer = ctx.
      search("", filter, controls).
      asInstanceOf[NamingEnumeration[SearchResult]]

    if (answer.hasMore) {
      Some(answer.next())
    } else {
      None
    }

  }
  
  def getLogo(email: String):Option[Array[Byte]] = {
    val ctx = connect()
    authenticate(ldapUser, ldapPassword, ctx)
    findByEmail(email, ctx)
        .map(_.getAttributes.get("thumbnailPhoto"))
        .flatMap(Option(_))
        .map(_.get.asInstanceOf[Array[Byte]])
        
  }
  
  def connect() = {
    val env = new Hashtable[String, String]() {
      put(Context.INITIAL_CONTEXT_FACTORY, "com.sun.jndi.ldap.LdapCtxFactory")
      put(Context.SECURITY_AUTHENTICATION, "simple")
      put(Context.PROVIDER_URL, url)
    }

    new InitialLdapContext(env, connCtls)
  }
}