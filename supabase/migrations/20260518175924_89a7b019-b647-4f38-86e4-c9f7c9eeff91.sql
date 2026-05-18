UPDATE public.posts
SET conteudo = regexp_replace(
                 regexp_replace(
                   regexp_replace(conteudo, 'iFood/Rappi', 'Apps de delivery', 'gi'),
                   'iFood', 'apps de delivery', 'gi'),
                 'Rappi|99 Food', 'apps de delivery', 'gi'),
    titulo = regexp_replace(titulo, 'iFood|Rappi|Magazine Luiza|Magalu|Itaú|Itau|Nubank|Bradesco|Natura|Ambev', 'apps e empresas', 'gi'),
    updated_at = now()
WHERE conteudo ~* '(iFood|Rappi|Magazine Luiza|Magalu|Itaú|Nubank|Bradesco|Natura|Ambev)'
   OR titulo ~* '(iFood|Rappi|Magazine Luiza|Magalu|Itaú|Nubank|Bradesco|Natura|Ambev)';