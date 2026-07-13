package br.com.infotecknet.backupthink.repository;

import br.com.infotecknet.backupthink.model.OLTModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OLTRepository extends JpaRepository<OLTModel, Long> {
    List<OLTModel> findAllByEnabledTrue();
}

